import React from 'react';
import _ from 'lodash';

import { Metrics } from './Metrics';
import { Filter } from './Filter';
import { Aggregations } from './Aggregations';
import { Alignments } from './Alignments';
import { AlignmentPeriods } from './AlignmentPeriods';
import { AliasBy } from './AliasBy';
import { Help } from './Help';
import { Target, MetricDescriptor } from '../types';
import { getAlignmentPickerData } from '../functions';

export interface Props {
  onQueryChange: (target: Target) => void;
  onExecuteQuery: () => void;
  target: Target;
  events: any;
  datasource: any;
  templateSrv: any;
}

interface State extends Target {
  alignOptions: any[];
  lastQuery: string;
  lastQueryError: string;
  [key: string]: any;
}

export const DefaultTarget: State = {
  defaultProject: 'loading project...',
  metricType: '',
  metricKind: '',
  valueType: '',
  refId: '',
  service: '',
  unit: '',
  crossSeriesReducer: 'REDUCE_MEAN',
  alignmentPeriod: 'stackdriver-auto',
  perSeriesAligner: 'ALIGN_MEAN',
  groupBys: [],
  filters: [],
  aliasBy: '',
  alignOptions: [],
  lastQuery: '',
  lastQueryError: '',
};

export class QueryEditor extends React.Component<Props, State> {
  state: State = DefaultTarget;

  componentDidMount() {
    const { events, target, templateSrv } = this.props;
    events.on('data-received', this.onDataReceived.bind(this));
    events.on('data-error', this.onDataError.bind(this));
    const { perSeriesAligner, alignOptions } = getAlignmentPickerData(target, templateSrv);
    this.setState({
      ...this.props.target,
      alignOptions,
      perSeriesAligner,
    });
  }

  componentWillUnmount() {
    this.props.events.off('data-received');
    this.props.events.off('data-error');
  }

  onDataReceived(dataList) {
    const series = dataList.find(item => item.refId === this.props.target.refId);
    if (series) {
      this.setState({ lastQuery: decodeURIComponent(series.meta.rawQuery), lastQueryError: '' });
    }
  }

  onDataError(err) {
    let lastQuery;
    let lastQueryError;
    if (err.data && err.data.error) {
      lastQueryError = this.props.datasource.formatStackdriverError(err);
    } else if (err.data && err.data.results) {
      const queryRes = err.data.results[this.props.target.refId];
      lastQuery = decodeURIComponent(queryRes.meta.rawQuery);
      if (queryRes && queryRes.error) {
        try {
          lastQueryError = JSON.parse(queryRes.error).error.message;
        } catch {
          lastQueryError = queryRes.error;
        }
      }
    }
    this.setState({ lastQuery, lastQueryError });
  }

  onMetricTypeChange({ valueType, metricKind, type, unit }: MetricDescriptor) {
    const { templateSrv, onQueryChange, onExecuteQuery } = this.props;
    const { perSeriesAligner, alignOptions } = getAlignmentPickerData(
      { valueType, metricKind, perSeriesAligner: this.state.perSeriesAligner },
      templateSrv
    );
    this.setState(
      {
        alignOptions,
        perSeriesAligner,
        metricType: type,
        unit,
        valueType,
        metricKind,
      },
      () => {
        onQueryChange(this.state);
        onExecuteQuery();
      }
    );
  }

  onPropertyChange(prop, value) {
    this.setState({ [prop]: value }, () => {
      this.props.onQueryChange(this.state);
      this.props.onExecuteQuery();
    });
  }

  render() {
    const {
      defaultProject,
      metricType,
      crossSeriesReducer,
      groupBys,
      filters,
      perSeriesAligner,
      alignOptions,
      alignmentPeriod,
      aliasBy,
      lastQuery,
      lastQueryError,
      refId,
    } = this.state;
    const { datasource, templateSrv } = this.props;

    return (
      <>
        <Metrics
          defaultProject={defaultProject}
          metricType={metricType}
          templateSrv={templateSrv}
          datasource={datasource}
          onChange={value => this.onMetricTypeChange(value)}
        >
          {metric => (
            <>
              <Filter
                filtersChanged={value => this.onPropertyChange('filters', value)}
                groupBysChanged={value => this.onPropertyChange('groupBys', value)}
                filters={filters}
                groupBys={groupBys}
                refId={refId}
                hideGroupBys={false}
                templateSrv={templateSrv}
                datasource={datasource}
                metricType={metric ? metric.type : ''}
              />
              <Aggregations
                metricDescriptor={metric}
                templateSrv={templateSrv}
                crossSeriesReducer={crossSeriesReducer}
                groupBys={groupBys}
                onChange={value => this.onPropertyChange('crossSeriesReducer', value)}
              >
                {displayAdvancedOptions =>
                  displayAdvancedOptions && (
                    <Alignments
                      alignOptions={alignOptions}
                      templateSrv={templateSrv}
                      perSeriesAligner={perSeriesAligner}
                      onChange={value => this.onPropertyChange('perSeriesAligner', value)}
                    />
                  )
                }
              </Aggregations>
              <AliasBy value={aliasBy} onChange={value => this.onPropertyChange('aliasBy', value)} />
              <AlignmentPeriods
                templateSrv={templateSrv}
                alignmentPeriod={alignmentPeriod}
                onChange={value => this.onPropertyChange('alignmentPeriod', value)}
              />
              <Help datasource={datasource} rawQuery={lastQuery} lastQueryError={lastQueryError} />
            </>
          )}
        </Metrics>
      </>
    );
  }
}
