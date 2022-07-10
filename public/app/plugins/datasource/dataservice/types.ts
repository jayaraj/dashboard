import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface DataserviceQuery extends DataQuery {
  api?: any;
  apidata?: any;
  rawQuery?: any;
  target?: any;
}

export interface DataserviceOptions extends DataSourceJsonData {}
