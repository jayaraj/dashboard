import { DataSourceJsonData, DateTime } from '@grafana/data';
import { DataQuery } from '@grafana/schema';

export interface Query extends DataQuery {
  queryApplication?: string;
  queryAPI?: string;
  queryArguments?: Data[];
}

export interface GrafoQuery {
  user_id: number;
  org_id: number;
  group_id: number;
  group_path: string;
  resource_id: number;
  role: string;
  range: Range;
  utc_offset: number;
  targets: Target[];
}

export interface Range {
  from: DateTime | string;
  to: DateTime | string;
  raw: RawRange;
}

export interface RawRange {
  from: number;
  to: number;
}

export interface DataSourceOptions extends DataSourceJsonData {
  url?: string;
}

export interface SecureJsonData {
  token?: string;
}

export const DEFAULT_QUERY: Partial<Query> = {
  queryApplication: '',
  queryAPI: '',
  queryArguments: [] as Data[],
};

export interface Target {
  application: string;
  apis: API[];
  refId: string;
}

export interface Application {
  application: string;
  apis: API[];
}

export interface API {
  name: string;
  data: Data[];
}

export interface Data {
  key: string;
  value: string;
}

export enum DataSourceTestStatus {
  SUCCESS = 'success',
  ERROR = 'error',
}
