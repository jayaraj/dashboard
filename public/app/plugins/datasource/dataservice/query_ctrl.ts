import { TemplateSrv } from 'app/features/templating/template_srv';
import { QueryCtrl } from 'app/plugins/sdk';

import { DataserviceQuery } from './types';

export class DataserviceDatasourceQueryCtrl extends QueryCtrl<DataserviceQuery> {
  scope: any;
  static templateUrl = 'partials/query.editor.html';
  targetSegment: any;
  apiSegment: any;
  uiService: any;
  apis: any;
  /** @ngInject */
  constructor($scope: any, $injector: any, private templateSrv: TemplateSrv, private uiSegmentSrv: any) {
    super($scope, $injector);
    this.scope = $scope;
    this.uiService = uiSegmentSrv;
    if (!this.target.target) {
      this.targetSegment = this.uiService.newSelectMeasurement('select metric');
    } else {
      this.targetSegment = uiSegmentSrv.newSegment(this.target.target);
    }
    if (!this.target.api) {
      this.apiSegment = this.uiService.newSelectMeasurement('select metric');
    } else {
      this.apiSegment = uiSegmentSrv.newSegment(this.target.api);
    }
    if (!this.target.apidata) {
      this.apiSegment.data = [];
    } else {
      this.apiSegment.data = this.target.apidata;
    }
  }

  getTargets(target: any) {
    const query = target === this.uiService.newSelectMeasurement('select metric') ? '' : target.value;
    return this.datasource
      .metricFindQuery(query)
      .then(this.transformToSegments(true))
      .catch(this.handleQueryError.bind(this));
  }

  targetChanged() {
    this.target.target = this.targetSegment.value;
    this.target.api = undefined;
    this.panelCtrl.refresh();
  }

  apiSelected() {
    this.target.api = this.apiSegment.value;
    this.target.apidata = this.apiSegment.data;
    this.panelCtrl.refresh();
  }

  handleQueryError(err: any): any[] {
    this.error = err.message || 'Failed to issue metric query';
    return [];
  }

  transformToSegments(addTemplateVars: any) {
    return (results: any) => {
      this.apis = results;
      const segments = _.map(results, (segment) => {
        return this.uiSegmentSrv.newSegment({
          value: segment.text,
          data: segment.data,
          expandable: segment.expandable,
        });
      });

      if (addTemplateVars) {
        for (const variable of this.templateSrv.variables) {
          segments.unshift(
            this.uiSegmentSrv.newSegment({
              type: 'value',
              value: '/^$' + variable.name + '$/',
              expandable: true,
            })
          );
        }
      }
      return segments;
    };
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.panelCtrl.refresh();
  }
}

DataserviceDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
