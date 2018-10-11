import { stackdriverUnitMappings } from './constants';
import appEvents from 'app/core/app_events';
import _ from 'lodash';

export default class StackdriverDatasource {
  id: number;
  url: string;
  baseUrl: string;
  projectName: string;
  authenticationType: string;
  queryPromise: Promise<any>;

  /** @ngInject */
  constructor(instanceSettings, private backendSrv, private templateSrv, private timeSrv) {
    this.baseUrl = `/stackdriver/`;
    this.url = instanceSettings.url;
    this.doRequest = this.doRequest;
    this.id = instanceSettings.id;
    this.projectName = instanceSettings.jsonData.defaultProject || '';
    this.authenticationType = instanceSettings.jsonData.authenticationType || 'jwt';
  }

  async getTimeSeries(options) {
    const queries = options.targets
      .filter(target => {
        return !target.hide && target.metricType;
      })
      .map(t => {
        if (!t.hasOwnProperty('aggregation')) {
          t.aggregation = {
            crossSeriesReducer: 'REDUCE_MEAN',
            groupBys: [],
          };
        }
        return {
          refId: t.refId,
          intervalMs: options.intervalMs,
          datasourceId: this.id,
          metricType: this.templateSrv.replace(t.metricType, options.scopedVars || {}),
          primaryAggregation: this.templateSrv.replace(t.aggregation.crossSeriesReducer, options.scopedVars || {}),
          perSeriesAligner: this.templateSrv.replace(t.aggregation.perSeriesAligner, options.scopedVars || {}),
          alignmentPeriod: this.templateSrv.replace(t.aggregation.alignmentPeriod, options.scopedVars || {}),
          groupBys: this.interpolateGroupBys(t.aggregation.groupBys, options.scopedVars),
          view: t.view || 'FULL',
          filters: (t.filters || []).map(f => {
            return this.templateSrv.replace(f, options.scopedVars || {});
          }),
          aliasBy: this.templateSrv.replace(t.aliasBy, options.scopedVars || {}),
          type: 'timeSeriesQuery',
        };
      });

    const { data } = await this.backendSrv.datasourceRequest({
      url: '/api/tsdb/query',
      method: 'POST',
      data: {
        from: options.range.from.valueOf().toString(),
        to: options.range.to.valueOf().toString(),
        queries,
      },
    });
    return data;
  }

  async getLabels(metricType, refId) {
    return await this.getTimeSeries({
      targets: [
        {
          refId: refId,
          datasourceId: this.id,
          metricType: this.templateSrv.replace(metricType),
          aggregation: {
            crossSeriesReducer: 'REDUCE_NONE',
          },
          view: 'HEADERS',
        },
      ],
      range: this.timeSrv.timeRange(),
    });
  }

  interpolateGroupBys(groupBys: string[], scopedVars): string[] {
    let interpolatedGroupBys = [];
    (groupBys || []).forEach(gb => {
      const interpolated = this.templateSrv.replace(gb, scopedVars || {}, 'csv').split(',');
      if (Array.isArray(interpolated)) {
        interpolatedGroupBys = interpolatedGroupBys.concat(interpolated);
      } else {
        interpolatedGroupBys.push(interpolated);
      }
    });
    return interpolatedGroupBys;
  }

  resolvePanelUnitFromTargets(targets: any[]) {
    let unit;
    if (targets.length > 0 && targets.every(t => t.unit === targets[0].unit)) {
      if (stackdriverUnitMappings.hasOwnProperty(targets[0].unit)) {
        unit = stackdriverUnitMappings[targets[0].unit];
      }
    }
    return unit;
  }

  async query(options) {
    this.queryPromise = new Promise(async resolve => {
      const result = [];
      const data = await this.getTimeSeries(options);
      if (data.results) {
        Object['values'](data.results).forEach(queryRes => {
          if (!queryRes.series) {
            return;
          }
          this.projectName = queryRes.meta.defaultProject;
          const unit = this.resolvePanelUnitFromTargets(options.targets);
          queryRes.series.forEach(series => {
            let timeSerie: any = {
              target: series.name,
              datapoints: series.points,
              refId: queryRes.refId,
              meta: queryRes.meta,
            };
            if (unit) {
              timeSerie = { ...timeSerie, unit };
            }
            result.push(timeSerie);
          });
        });
      }

      resolve({ data: result });
    });
    return this.queryPromise;
  }

  async annotationQuery(options) {
    const annotation = options.annotation;
    const queries = [
      {
        refId: 'annotationQuery',
        datasourceId: this.id,
        metricType: this.templateSrv.replace(annotation.target.metricType, options.scopedVars || {}),
        primaryAggregation: 'REDUCE_NONE',
        perSeriesAligner: 'ALIGN_NONE',
        title: this.templateSrv.replace(annotation.target.title, options.scopedVars || {}),
        text: this.templateSrv.replace(annotation.target.text, options.scopedVars || {}),
        tags: this.templateSrv.replace(annotation.target.tags, options.scopedVars || {}),
        view: 'FULL',
        filters: (annotation.target.filters || []).map(f => {
          return this.templateSrv.replace(f, options.scopedVars || {});
        }),
        type: 'annotationQuery',
      },
    ];

    const { data } = await this.backendSrv.datasourceRequest({
      url: '/api/tsdb/query',
      method: 'POST',
      data: {
        from: options.range.from.valueOf().toString(),
        to: options.range.to.valueOf().toString(),
        queries,
      },
    });

    const results = data.results['annotationQuery'].tables[0].rows.map(v => {
      return {
        annotation: annotation,
        time: Date.parse(v[0]),
        title: v[1],
        tags: [],
        text: v[3],
      };
    });

    return results;
  }

  metricFindQuery(query) {
    throw new Error('Template variables support is not yet imlemented');
  }

  async testDatasource() {
    let status, message;
    const defaultErrorMessage = 'Cannot connect to Stackdriver API';
    try {
      const projectName = await this.getDefaultProject();
      const path = `v3/projects/${projectName}/metricDescriptors`;
      const response = await this.doRequest(`${this.baseUrl}${path}`);
      if (response.status === 200) {
        status = 'success';
        message = 'Successfully queried the Stackdriver API.';
      } else {
        status = 'error';
        message = response.statusText ? response.statusText : defaultErrorMessage;
      }
    } catch (error) {
      status = 'error';
      if (_.isString(error)) {
        message = error;
      } else {
        message = 'Stackdriver: ';
        message += error.statusText ? error.statusText + ': ' : '';
        if (error.data && error.data.error && error.data.error.code) {
          message += error.data.error.code + '. ' + error.data.error.message;
        } else {
          message = defaultErrorMessage;
        }
      }
    } finally {
      return {
        status,
        message,
      };
    }
  }

  formatStackdriverError(error) {
    let message = 'Stackdriver: ';
    message += error.statusText ? error.statusText + ': ' : '';
    if (error.data && error.data.error) {
      try {
        const res = JSON.parse(error.data.error);
        message += res.error.code + '. ' + res.error.message;
      } catch (err) {
        message += error.data.error;
      }
    } else {
      message += 'Cannot connect to Stackdriver API';
    }
    return message;
  }

  async getDefaultProject() {
    try {
      if (this.authenticationType === 'gce' || !this.projectName) {
        const { data } = await this.backendSrv.datasourceRequest({
          url: '/api/tsdb/query',
          method: 'POST',
          data: {
            queries: [
              {
                refId: 'ensureDefaultProjectQuery',
                type: 'ensureDefaultProjectQuery',
                datasourceId: this.id,
              },
            ],
          },
        });
        this.projectName = data.results.ensureDefaultProjectQuery.meta.defaultProject;
        return this.projectName;
      } else {
        return this.projectName;
      }
    } catch (error) {
      throw this.formatStackdriverError(error);
    }
  }

  async getMetricTypes(projectName: string) {
    try {
      const metricsApiPath = `v3/projects/${projectName}/metricDescriptors`;
      const { data } = await this.doRequest(`${this.baseUrl}${metricsApiPath}`);

      const metrics = data.metricDescriptors.map(m => {
        const [service] = m.type.split('/');
        const [serviceShortName] = service.split('.');
        m.service = service;
        m.serviceShortName = serviceShortName;
        m.displayName = m.displayName || m.type;
        return m;
      });

      return metrics;
    } catch (error) {
      appEvents.emit('ds-request-error', this.formatStackdriverError(error));
      return [];
    }
  }

  async doRequest(url, maxRetries = 1) {
    return this.backendSrv
      .datasourceRequest({
        url: this.url + url,
        method: 'GET',
      })
      .catch(error => {
        if (maxRetries > 0) {
          return this.doRequest(url, maxRetries - 1);
        }

        throw error;
      });
  }
}
