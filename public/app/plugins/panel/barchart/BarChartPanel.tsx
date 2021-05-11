import React, { useCallback, useMemo } from 'react';
import { FieldType, PanelProps, TimeRange, VizOrientation } from '@grafana/data';
import { GraphNGLegendEvent, TooltipPlugin } from '@grafana/ui';
import { hideSeriesConfigFactory } from '../timeseries/overrides/hideSeriesConfigFactory';
import { BarChartOptions } from './types';
import { BarChart } from './BarChart';

interface Props extends PanelProps<BarChartOptions> {}

/**
 * @alpha
 */
export const BarChartPanel: React.FunctionComponent<Props> = ({
  data,
  options,
  width,
  height,
  fieldConfig,
  timeZone,
  onFieldConfigChange,
}) => {
  const orientation = useMemo(() => {
    if (!options.orientation || options.orientation === VizOrientation.Auto) {
      return width < height ? VizOrientation.Horizontal : VizOrientation.Vertical;
    }

    return options.orientation;
  }, [width, height, options.orientation]);

  const onLegendClick = useCallback(
    (event: GraphNGLegendEvent) => {
      onFieldConfigChange(hideSeriesConfigFactory(event, fieldConfig, data.series));
    },
    [fieldConfig, onFieldConfigChange, data.series]
  );

  if (!data || !data.series?.length) {
    return (
      <div className="panel-empty">
        <p>No data found in response</p>
      </div>
    );
  }

  const firstFrame = data.series[0];
  if (!firstFrame.fields.some((f) => f.type === FieldType.string)) {
    return (
      <div className="panel-empty">
        <p>Bar charts requires a string field</p>
      </div>
    );
  }
  if (!firstFrame.fields.some((f) => f.type === FieldType.number)) {
    return (
      <div className="panel-empty">
        <p>No numeric fields found</p>
      </div>
    );
  }

  return (
    <BarChart
      frames={data.series}
      timeZone={timeZone}
      timeRange={({ from: 1, to: 1 } as unknown) as TimeRange} // HACK
      structureRev={data.structureRev}
      width={width}
      height={height}
      onLegendClick={onLegendClick}
      {...options}
      orientation={orientation}
    >
      {(config, alignedFrame) => {
        return <TooltipPlugin data={alignedFrame} config={config} mode={options.tooltip.mode} timeZone={timeZone} />;
      }}
    </BarChart>
  );
};
