// eslint-disable-next-line lodash/import-scope
import _ from 'lodash';
import { lastValueFrom, of } from 'rxjs';
import { catchError, mapTo } from 'rxjs/operators';

import { dateMath, DataSourceApi, DataSourceInstanceSettings, DataQueryResponse } from '@grafana/data';
import { getBackendSrv } from '@grafana/runtime';
import { toTestingStatus } from '@grafana/runtime/src/utils/queryResponse';
import { BackendSrv } from 'app/core/services/backend_srv';
import { contextSrv } from 'app/core/services/context_srv';
import { TemplateSrv } from 'app/features/templating/template_srv';

import { DataserviceQuery, DataserviceOptions } from './types';

export class DataserviceDatasource extends DataSourceApi<DataserviceQuery, DataserviceOptions> {
  name: any;
  type: any;
  url: any;
  withCredentials: any;
  headers: any;
  context: any;
  dataConfigs: any;

  /** @ngInject */
  constructor(
    instanceSettings: DataSourceInstanceSettings<DataserviceOptions>,
    private backendSrv: BackendSrv,
    private templateSrv: TemplateSrv
  ) {
    super(instanceSettings);
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = { 'Content-Type': 'application/json' };
    this.context = contextSrv;
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options: any): Promise<DataQueryResponse> {
    const query = this.buildQueryParameters(options);
    query.targets = _.filter(query.targets, (item: { hide: boolean }) => item.hide !== true);
    const grp = this.templateSrv.replace('${group}', options.scopedVars, 'regex');
    let grpPath = this.templateSrv.replace('${grouppath}', options.scopedVars, 'regex');
    const resource = this.templateSrv.replace('${resource}', options.scopedVars, 'regex');
    const grpId = grp ? Number(grp) : 0;
    grpPath = grpPath ? grpPath : '0,';
    const resourceId = resource ? Number(resource) : 0;
    query.user_id = this.context.user.id;
    query.org_id = this.context.user.orgId;
    query.resource_id = Number(resourceId);
    query.group_id = Number(grpId);
    query.group_path = grpPath;
    query.role = this.context.user.isGrafanaAdmin
      ? this.convertRole('SuperAdmin')
      : this.convertRole(this.context.user.orgRole);
    query.intervalms = options.intervalMs;
    query.range = {
      from: dateMath.parse(options.rangeRaw.from, false, options.timezone)!.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      to: dateMath.parse(options.rangeRaw.to, false, options.timezone)!.format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      raw: {
        from: options.range.from.valueOf(),
        to: options.range.to.valueOf(),
      },
    };

    if (query.targets.length <= 0) {
      return Promise.resolve({ data: [] });
    }

    if (this.templateSrv.getAdhocFilters) {
      query.adhocFilters = this.templateSrv.getAdhocFilters(this.name);
    } else {
      query.adhocFilters = [];
    }

    return new Promise((resolve, reject) => {
      this.doRequest({
        url: this.url + '/api/query',
        data: query,
        method: 'POST',
      }).then((result: { data: any }) => {
        var decodedPayload = atob(result.data.data);
        resolve({
          data: JSON.parse(decodedPayload),
        });
      });
    });
  }
  async testDatasource(): Promise<any> {
    return lastValueFrom(
      getBackendSrv()
        .fetch({
          url: this.url + '/api/search',
          method: 'POST',
        })
        .pipe(
          mapTo({ status: 'success', message: 'Database Connection OK' }),
          catchError((err) => {
            return of(toTestingStatus(err));
          })
        )
    );
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

  metricFindQuery(target: any) {
    return this.doRequest({
      url: this.url + '/api/search',
      data: {},
      method: 'POST',
    }).then((result) => this.mapTargetsToTextValue(result, target));
  }

  mapTargetsToTextValue(result: { data: any }, target: any) {
    if (target !== undefined && target !== '') {
      for (const t of result.data.targets) {
        if (t.application === target) {
          return _.map(t.apis, (api: { name: any; data: any }) => {
            return { text: api.name, value: api.name, data: api.data };
          });
        }
      }
      return [];
    } else {
      return _.map(result.data.targets, (val: { application: any }) => {
        return { text: val.application, value: val.application };
      });
    }
  }

  doRequest(options: any) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options: any) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, (target: { target: string }) => {
      return target.target !== 'select metric';
    });
    options.scopedVars = {
      ...options.scopedVars,
    };

    const targets = _.map(
      options.targets,
      (target: { apidata: string | any[]; target: any; api: any; refId: any; hide: any }) => {
        if (target.apidata !== undefined) {
          for (var i = 0; i < target.apidata.length; i++) {
            target.apidata[i].value = this.templateSrv.replace(target.apidata[i].value, options.scopedVars, 'regex');
          }
        }
        return {
          application: target.target,
          apis: [{ name: target.api, data: target.apidata }],
          refId: target.refId,
          hide: target.hide,
          type: 'table',
        };
      }
    );
    options.targets = targets;
    return options;
  }
}
