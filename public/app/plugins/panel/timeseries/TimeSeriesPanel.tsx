import React, { useMemo, useState, useCallback  } from 'react';

import { Field, PanelProps, CartesianCoords2D } from '@grafana/data';
import { PanelDataErrorView, getBackendSrv } from '@grafana/runtime';
import { TooltipDisplayMode } from '@grafana/schema';
import { usePanelContext, TimeSeries, TooltipPlugin, ZoomPlugin, KeyboardPlugin, MenuItemProps } from '@grafana/ui';
import { config } from 'app/core/config';
import { getFieldLinksForExplore } from 'app/features/explore/utils/links';

import { AnnotationEditorPlugin } from './plugins/AnnotationEditorPlugin';
import { AnnotationsPlugin } from './plugins/AnnotationsPlugin';
import { ContextMenuPlugin } from './plugins/ContextMenuPlugin';
import { ExemplarsPlugin } from './plugins/ExemplarsPlugin';
import { OutsideRangePlugin } from './plugins/OutsideRangePlugin';
import { ThresholdControlsPlugin } from './plugins/ThresholdControlsPlugin';
import { TimescaleEditor } from './plugins/timescales/TimescaleEditor';
import { TimescaleEditFormDTO } from './plugins/timescales/TimescaleEditorForm';
import { TimeSeriesOptions } from './types';
import { getTimezones, prepareGraphableFields } from './utils';

interface TimeSeriesPanelProps extends PanelProps<TimeSeriesOptions> {}

export const TimeSeriesPanel: React.FC<TimeSeriesPanelProps> = ({
  data,
  timeRange,
  timeZone,
  width,
  height,
  options,
  fieldConfig,
  onChangeTimeRange,
  replaceVariables,
  id,
}) => {
  const { sync, onThresholdsChange, canEditThresholds, onSplitOpen } = usePanelContext();

  const getFieldLinks = (field: Field, rowIndex: number) => {
    return getFieldLinksForExplore({ field, rowIndex, splitOpenFn: onSplitOpen, range: timeRange });
  };

  const [isAddingTimescale, setAddingTimescale] = useState(false);
  const [timescaleTriggerCoords, setTimescaleTriggerCoords] = useState<{
    viewport: CartesianCoords2D;
    plotCanvas: CartesianCoords2D;
  } | null>(null);

  const frames = useMemo(() => prepareGraphableFields(data.series, config.theme2, timeRange), [data, timeRange]);
  const timezones = useMemo(() => getTimezones(options.timezone, timeZone), [options.timezone, timeZone]);

  const mappings = fieldConfig.defaults.mappings;
  let scales: string[] = [];

  if (mappings && mappings.length) {
    mappings.map((mapping: any) => mapping.options).map((mapping: any) => {
      Object.keys(mapping).forEach((key: string) => {
        if (key.toLowerCase().match(/scale/)) {
          scales.push(mapping[key].text);
        }
      }) 
    });
  }

  const onAddTimescale = useCallback(
    async (formData: TimescaleEditFormDTO) => {
      const { min, max, description, scale } = formData;
      const user = config.bootData.user;
      const userId = user?.id;
      const sanitizedDescription = description.replace(/\"|\'/g, '');
      const rawSql = `insert into scales values(now(), ${min}, ${max}, '${sanitizedDescription}', ${userId}, '${scale}')`;
      const target = data.request?.targets[0];
      const datasourceId = target?.datasource?.uid;
      const refId = target?.refId;

      await getBackendSrv().post('/api/ds/query', {
        debug: true,
        from: 'now-1h',
        publicDashboardAccessToken: 'string',
        queries: [
          {
            datasource: {
              uid: datasourceId,
            },
            format: 'table',
            intervalMs: 86400000,
            maxDataPoints: 1092,
            rawSql,
            refId,
          },
        ],
        to: 'now',
      });
      setAddingTimescale(false);
    },
    [data]
  );

  if (!frames) {
    return (
      <PanelDataErrorView
        panelId={id}
        fieldConfig={fieldConfig}
        data={data}
        needsTimeField={true}
        needsNumberField={true}
      />
    );
  }

  const enableAnnotationCreation = true;

  return (
    <TimeSeries
      frames={frames}
      structureRev={data.structureRev}
      timeRange={timeRange}
      timeZone={timezones}
      width={width}
      height={height}
      legend={options.legend}
      options={options}
    >
      {(config, alignedDataFrame) => {

        const defaultContextMenuItems: MenuItemProps[] = scales.length ? [
          {
            label: 'Update scale',
            ariaLabel: 'Update scale',
            icon: 'channel-add',
            onClick: (e, p) => {
              setTimescaleTriggerCoords(p.coords);
              setAddingTimescale(true);
            },
          },
        ] : [];

        return (
          <>
            <KeyboardPlugin config={config} />
            <ZoomPlugin config={config} onZoom={onChangeTimeRange} />
            {options.tooltip.mode === TooltipDisplayMode.None || (
              <TooltipPlugin
                frames={frames}
                data={alignedDataFrame}
                config={config}
                mode={options.tooltip.mode}
                sortOrder={options.tooltip.sort}
                sync={sync}
                timeZone={timeZone}
              />
            )}
            {/* Renders annotation markers*/}
            {data.annotations && (
              <AnnotationsPlugin annotations={data.annotations} config={config} timeZone={timeZone} />
            )}
            {/* Enables annotations creation*/}
            {enableAnnotationCreation ? (
              <AnnotationEditorPlugin
                data={alignedDataFrame}
                timeZone={timeZone}
                config={config}
                filter={options.annotationFilter}
              >
                {({ startAnnotating }) => {
                  return (
                    <ContextMenuPlugin
                      data={alignedDataFrame}
                      config={config}
                      timeZone={timeZone}
                      replaceVariables={replaceVariables}
                      defaultItems={[
                        {
                          items: [
                            {
                              label: 'Add annotation',
                              ariaLabel: 'Add annotation',
                              icon: 'comment-alt',
                              onClick: (e, p) => {
                                if (!p) {
                                  return;
                                }
                                startAnnotating({ coords: p.coords });
                              },
                            },
                            ...defaultContextMenuItems,
                          ],
                        },
                      ]}
                    />
                  );
                }}
              </AnnotationEditorPlugin>
            ) : (
              <ContextMenuPlugin
                data={alignedDataFrame}
                frames={frames}
                config={config}
                timeZone={timeZone}
                replaceVariables={replaceVariables}
                defaultItems={[
                  {
                    items: defaultContextMenuItems,
                  },
                ]}
              />
            )}
            {isAddingTimescale && (
              <TimescaleEditor
                onSave={onAddTimescale}
                onDismiss={() => setAddingTimescale(false)}
                scales={scales}
                style={{
                  position: 'absolute',
                  left: timescaleTriggerCoords?.viewport?.x,
                  top: timescaleTriggerCoords?.viewport?.y,
                }}
              />
            )}
            {data.annotations && (
              <ExemplarsPlugin
                config={config}
                exemplars={data.annotations}
                timeZone={timeZone}
                getFieldLinks={getFieldLinks}
              />
            )}

            {canEditThresholds && onThresholdsChange && (
              <ThresholdControlsPlugin
                config={config}
                fieldConfig={fieldConfig}
                onThresholdsChange={onThresholdsChange}
              />
            )}

            <OutsideRangePlugin config={config} onChangeTimeRange={onChangeTimeRange} />
          </>
        );
      }}
    </TimeSeries>
  );
};
