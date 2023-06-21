import { DataSourceInstanceSettings, FieldType, MutableDataFrame, TimeRange } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { DataSourceOptions, Query } from '../types';

/**
 * API
 */
export class Api {
  /**
   * Constructor
   */
  constructor(public instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {

  }

  /**
   * Get data
   */
  getData(query: Query, range: TimeRange): MutableDataFrame {

    return new MutableDataFrame({
      refId: query.refId,
      fields: [
        { name: 'Time', values: [range.from, range.to], type: FieldType.time },
        { name: 'Value', values: [1, 2], type: FieldType.number },
      ],
    });
  }

  /**
   * Get options
   */
  async getOptions(): Promise<any>  {
    return await getBackendSrv().datasourceRequest({
      url: this.instanceSettings.url + '/api/search',
      method: 'POST',
    });
  }
}
