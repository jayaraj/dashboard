import _ from 'lodash';
import { QueryCtrl } from 'app/plugins/sdk';
import './query_aggregation_ctrl';
import './query_filter_ctrl';
import { StackdriverPicker } from './components/StackdriverPicker';
import { react2AngularDirective } from 'app/core/utils/react2angular';

export interface QueryMeta {
  alignmentPeriod: string;
  rawQuery: string;
  rawQueryString: string;
  metricLabels: { [key: string]: string[] };
  resourceLabels: { [key: string]: string[] };
}

export class StackdriverQueryCtrl extends QueryCtrl {
  static templateUrl = 'partials/query.editor.html';
  target: {
    defaultProject: string;
    unit: string;
    metricType: string;
    service: string;
    refId: string;
    aggregation: {
      crossSeriesReducer: string;
      alignmentPeriod: string;
      perSeriesAligner: string;
      groupBys: string[];
    };
    filters: string[];
    aliasBy: string;
    metricKind: any;
    valueType: any;
  };

  defaults = {
    defaultProject: 'loading project...',
    metricType: '',
    service: '',
    metric: '',
    unit: '',
    aggregation: {
      crossSeriesReducer: 'REDUCE_MEAN',
      alignmentPeriod: 'stackdriver-auto',
      perSeriesAligner: 'ALIGN_MEAN',
      groupBys: [],
    },
    filters: [],
    showAggregationOptions: false,
    aliasBy: '',
    metricKind: '',
    valueType: '',
  };

  showHelp: boolean;
  showLastQuery: boolean;
  lastQueryMeta: QueryMeta;
  lastQueryError?: string;

  /** @ngInject */
  constructor($scope, $injector) {
    super($scope, $injector);
    _.defaultsDeep(this.target, this.defaults);
    this.panelCtrl.events.on('data-received', this.onDataReceived.bind(this), $scope);
    this.panelCtrl.events.on('data-error', this.onDataError.bind(this), $scope);
    react2AngularDirective('stackdriverPicker', StackdriverPicker, [
      'options',
      'onChange',
      'value',
      'isSearchable',
      'className',
      'placeholder',
      'groupName',
      ['variables', { watchDepth: 'reference' }],
    ]);
  }

  onDataReceived(dataList) {
    this.lastQueryError = null;
    this.lastQueryMeta = null;

    const anySeriesFromQuery: any = _.find(dataList, { refId: this.target.refId });
    if (anySeriesFromQuery) {
      this.lastQueryMeta = anySeriesFromQuery.meta;
      this.lastQueryMeta.rawQueryString = decodeURIComponent(this.lastQueryMeta.rawQuery);
    }
  }

  onDataError(err) {
    if (err.data && err.data.results) {
      const queryRes = err.data.results[this.target.refId];
      if (queryRes && queryRes.error) {
        this.lastQueryMeta = queryRes.meta;
        this.lastQueryMeta.rawQueryString = decodeURIComponent(this.lastQueryMeta.rawQuery);

        let jsonBody;
        try {
          jsonBody = JSON.parse(queryRes.error);
        } catch {
          this.lastQueryError = queryRes.error;
        }

        this.lastQueryError = jsonBody.error.message;
      }
    }
  }
}
