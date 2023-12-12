import { DataSourceInstanceSettings, MutableDataFrame, toDataFrame } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';

import { DataSourceOptions, GrafoQuery } from './types';

export class Api {
  constructor(public instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {}

  async getData(query: GrafoQuery): Promise<MutableDataFrame[]> {
    const response = await getBackendSrv().datasourceRequest({
      url: this.instanceSettings.url + '/api/query',
      method: 'POST',
      data: query,
    });

    const decodedPayload = JSON.parse(atob(response.data.data));
    if (decodedPayload === undefined) {
      return query.targets.map((target) => {
        return new MutableDataFrame({
          refId: target.refId,
          fields: [],
        });
      });
    }
    return decodedPayload.map((d: any) => toDataFrame(d));
  }

  async getOptions(): Promise<any> {
    return await getBackendSrv().datasourceRequest({
      url: this.instanceSettings.url + '/api/search',
      method: 'POST',
    });
  }
}
