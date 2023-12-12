import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceInstanceSettings,
  CoreApp,
  DataSourceApi,
  dateMath,
} from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { contextSrv } from 'app/core/services/context_srv';

import { Api } from './api';
import { Query, DataSourceOptions, DEFAULT_QUERY, DataSourceTestStatus, GrafoQuery, Data } from './types';

export class DataSource extends DataSourceApi<Query, DataSourceOptions> {
  api: Api;

  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);
    this.api = new Api(instanceSettings);
  }

  convertRole(role: string) {
    switch (role) {
      case 'Viewer':
        return 'ROLE_VIEWER';
      case 'Editor':
        return 'ROLE_EDITOR';
      case 'Admin':
        return 'ROLE_ADMIN';
      case 'SuperAdmin':
        return 'ROLE_SUPERADMIN';
      default:
        return 'ROLE_UNSPECIFIED';
    }
  }

  async query(options: DataQueryRequest<Query>): Promise<DataQueryResponse> {
    const { range, rangeRaw, timezone, scopedVars, targets } = options;
    const templateSrv = getTemplateSrv();
    const group = templateSrv.replace('${group}', scopedVars, 'regex');
    let groupPath = templateSrv.replace('${grouppath}', scopedVars, 'regex');
    const resource = templateSrv.replace('${resource}', scopedVars, 'regex');
    const args: GrafoQuery = {
      user_id: contextSrv.user.id,
      org_id: contextSrv.user.orgId,
      group_id: group ? Number(group) : 0,
      group_path: groupPath ? groupPath : '0,',
      resource_id: resource ? Number(resource) : 0,
      role: contextSrv.user.isGrafanaAdmin ? this.convertRole('SuperAdmin') : this.convertRole(contextSrv.user.orgRole),
      utc_offset: range.from.utcOffset(),
      range: {
        from: dateMath.parse(rangeRaw!.from, false, timezone)!.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        to: dateMath.parse(rangeRaw!.to, false, timezone)!.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        raw: {
          from: range.from.valueOf(),
          to: range.to.valueOf(),
        },
      },
      targets: targets.map((target) => {
        let queryArguments = [] as Data[];
        if (target.queryArguments !== undefined) {
          queryArguments = target.queryArguments.map((pair) => {
            return { ...pair, value: templateSrv.replace(pair.value, scopedVars, 'regex') };
          });
        }
        return {
          application: target.queryApplication!,
          apis: [{ name: target.queryAPI!, data: queryArguments }],
          refId: target.refId,
        };
      }),
    };
    const response = await this.api.getData(args);
    return { data: response };
  }

  async testDatasource() {
    const response = await this.api.getOptions();
    const isStatusOk = response.data.targets ? true : false;
    return {
      status: isStatusOk ? DataSourceTestStatus.SUCCESS : DataSourceTestStatus.ERROR,
      message: isStatusOk ? `Connected.` : "Error. Can't connect.",
    };
  }

  getDefaultQuery(_: CoreApp): Partial<Query> {
    return DEFAULT_QUERY;
  }
}
