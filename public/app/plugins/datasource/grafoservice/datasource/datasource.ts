import { DataQueryRequest, DataQueryResponse, DataSourceApi, DataSourceInstanceSettings } from '@grafana/data';
import { Api } from '../api';
import { DataSourceOptions, Query } from '../types';
import { DataSourceTestStatus } from '../constants';

/**
 * Datasource
 */
export class DataSource extends DataSourceApi<Query, DataSourceOptions> {
  /**
   * Api
   *
   * @type {Api} api
   */
  api: Api;

  /**
   * Constructor
   */
  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);
    this.api = new Api(instanceSettings);
  }

  /**
   * Query
   */
  async query(options: DataQueryRequest<Query>): Promise<DataQueryResponse> {
    const { range } = options;

    /**
     * Process targets
     */
    const data = options.targets.map((target) => this.api.getData(target, range));

    /**
     * Return data
     */
    return { data };
  }

  async testDatasource() {
    const response =  await this.api.getOptions();
    const isStatusOk = response.data.targets ? true : false;
    return {
      status: isStatusOk ? DataSourceTestStatus.SUCCESS : DataSourceTestStatus.ERROR,
      message: isStatusOk ? `Connected.` : "Error. Can't connect.",
    };
  }
}
