import { DataQuery, DataSourceJsonData } from '@grafana/data';

/**
 * Query
 */
export interface Query extends DataQuery {
  /**
   * Query Module
   *
   * @type {string}
   */
  queryModule?: string;

  /**
   * Query API
   *
   * @type {string}
   */
  queryAPI?: string;

  /**
   * Query Arugments json
   *
   * @type {string}
   */
  queryArguments?: Data[];

  /**
   * Format
   *
   * @type {string}
   */
  format?: string;
}

/**
 * Datasource Options
 */
export interface DataSourceOptions extends DataSourceJsonData {
  /**
   * Url
   *
   * @type {string}
   */
  url?: string;
}

/**
 * Secure JSON Data
 */
export interface SecureJsonData {
  /**
   * Token
   *
   * @type {string}
   */
  token?: string;
}

export interface Target {
  targets: Application[];
}

export interface Application {
  application: string;
  apis: API[];
}

export interface API {
  name: string
  data: Data [];
}

export interface Data {
  key: string;
  value: string;
}
