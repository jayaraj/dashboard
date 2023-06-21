import { SelectableValue } from '@grafana/data';
import { Data, Query } from './types';

/**
 * Datasource test status
 */
export enum DataSourceTestStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}

/**
 * Defaults for Query
 */
export const defaultQuery: Partial<Query> = {
  queryModule: '',
  queryAPI: '',
  format: 'timeseries',
  queryArguments: [] as Data[],
};

/**
 * Query Formats
 */
export const queryFormats: Array<SelectableValue<string>> = [
  {
    label: 'Table',
    value: 'table',
  },
  {
    label: 'Time Series',
    value: 'timeseries',
  },
];