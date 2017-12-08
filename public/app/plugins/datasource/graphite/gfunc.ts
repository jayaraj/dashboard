import _ from 'lodash';
import { isVersionGtOrEq } from 'app/core/utils/version';

var index = {};

function addFuncDef(funcDef) {
  funcDef.params = funcDef.params || [];
  funcDef.defaultParams = funcDef.defaultParams || [];

  index[funcDef.name] = funcDef;
  if (funcDef.shortName) {
    index[funcDef.shortName] = funcDef;
  }
}

var optionalSeriesRefArgs = [{ name: 'other', type: 'value_or_series', optional: true, multiple: true }];

addFuncDef({
  name: 'scaleToSeconds',
  category: 'Transform',
  params: [{ name: 'seconds', type: 'int' }],
  defaultParams: [1],
});

addFuncDef({
  name: 'perSecond',
  category: 'Transform',
  params: [{ name: 'max value', type: 'int', optional: true }],
  defaultParams: [],
});

addFuncDef({
  name: 'holtWintersForecast',
  category: 'Calculate',
});

addFuncDef({
  name: 'holtWintersConfidenceBands',
  category: 'Calculate',
  params: [{ name: 'delta', type: 'int' }],
  defaultParams: [3],
});

addFuncDef({
  name: 'holtWintersAberration',
  category: 'Calculate',
  params: [{ name: 'delta', type: 'int' }],
  defaultParams: [3],
});

addFuncDef({
  name: 'nPercentile',
  category: 'Calculate',
  params: [{ name: 'Nth percentile', type: 'int' }],
  defaultParams: [95],
});

addFuncDef({
  name: 'diffSeries',
  params: optionalSeriesRefArgs,
  defaultParams: ['#A'],
  category: 'Calculate',
});

addFuncDef({
  name: 'stddevSeries',
  params: optionalSeriesRefArgs,
  defaultParams: [''],
  category: 'Calculate',
});

addFuncDef({
  name: 'divideSeries',
  params: optionalSeriesRefArgs,
  defaultParams: ['#A'],
  category: 'Calculate',
});

addFuncDef({
  name: 'multiplySeries',
  params: optionalSeriesRefArgs,
  defaultParams: ['#A'],
  category: 'Calculate',
});

addFuncDef({
  name: 'asPercent',
  params: optionalSeriesRefArgs,
  defaultParams: ['#A'],
  category: 'Calculate',
});

addFuncDef({
  name: 'group',
  params: optionalSeriesRefArgs,
  defaultParams: ['#A', '#B'],
  category: 'Combine',
});

addFuncDef({
  name: 'sumSeries',
  shortName: 'sum',
  category: 'Combine',
  params: optionalSeriesRefArgs,
  defaultParams: [''],
});

addFuncDef({
  name: 'averageSeries',
  shortName: 'avg',
  category: 'Combine',
  params: optionalSeriesRefArgs,
  defaultParams: [''],
});

addFuncDef({
  name: 'rangeOfSeries',
  category: 'Combine',
});

addFuncDef({
  name: 'percentileOfSeries',
  category: 'Combine',
  params: [{ name: 'n', type: 'int' }, { name: 'interpolate', type: 'boolean', options: ['true', 'false'] }],
  defaultParams: [95, 'false'],
});

addFuncDef({
  name: 'sumSeriesWithWildcards',
  category: 'Combine',
  params: [{ name: 'node', type: 'int', multiple: true }],
  defaultParams: [3],
});

addFuncDef({
  name: 'maxSeries',
  shortName: 'max',
  category: 'Combine',
});

addFuncDef({
  name: 'minSeries',
  shortName: 'min',
  category: 'Combine',
});

addFuncDef({
  name: 'averageSeriesWithWildcards',
  category: 'Combine',
  params: [{ name: 'node', type: 'int', multiple: true }],
  defaultParams: [3],
});

addFuncDef({
  name: 'alias',
  category: 'Special',
  params: [{ name: 'alias', type: 'string' }],
  defaultParams: ['alias'],
});

addFuncDef({
  name: 'aliasSub',
  category: 'Special',
  params: [{ name: 'search', type: 'string' }, { name: 'replace', type: 'string' }],
  defaultParams: ['', '\\1'],
});

addFuncDef({
  name: 'stacked',
  category: 'Special',
  params: [{ name: 'stack', type: 'string' }],
  defaultParams: ['stacked'],
});

addFuncDef({
  name: 'consolidateBy',
  category: 'Special',
  params: [
    {
      name: 'function',
      type: 'string',
      options: ['sum', 'average', 'min', 'max'],
    },
  ],
  defaultParams: ['max'],
});

addFuncDef({
  name: 'cumulative',
  category: 'Special',
  params: [],
  defaultParams: [],
});

addFuncDef({
  name: 'groupByNode',
  category: 'Special',
  params: [
    {
      name: 'node',
      type: 'int',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
    },
    {
      name: 'function',
      type: 'string',
      options: ['sum', 'avg', 'maxSeries'],
    },
  ],
  defaultParams: [3, 'sum'],
});

addFuncDef({
  name: 'aliasByNode',
  category: 'Special',
  params: [
    {
      name: 'node',
      type: 'int',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
      multiple: true,
    },
  ],
  defaultParams: [3],
});

addFuncDef({
  name: 'substr',
  category: 'Special',
  params: [
    {
      name: 'start',
      type: 'int',
      options: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
    },
    {
      name: 'stop',
      type: 'int',
      options: [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
    },
  ],
  defaultParams: [0, 0],
});

addFuncDef({
  name: 'sortByName',
  category: 'Special',
  params: [
    {
      name: 'natural',
      type: 'boolean',
      options: ['true', 'false'],
      optional: true,
    },
  ],
  defaultParams: ['false'],
});

addFuncDef({
  name: 'sortByMaxima',
  category: 'Special',
});

addFuncDef({
  name: 'sortByMinima',
  category: 'Special',
});

addFuncDef({
  name: 'sortByTotal',
  category: 'Special',
});

addFuncDef({
  name: 'aliasByMetric',
  category: 'Special',
});

addFuncDef({
  name: 'randomWalk',
  fake: true,
  category: 'Special',
  params: [{ name: 'name', type: 'string' }],
  defaultParams: ['randomWalk'],
});

addFuncDef({
  name: 'countSeries',
  category: 'Special',
});

addFuncDef({
  name: 'constantLine',
  category: 'Special',
  params: [{ name: 'value', type: 'int' }],
  defaultParams: [10],
});

addFuncDef({
  name: 'cactiStyle',
  category: 'Special',
});

addFuncDef({
  name: 'keepLastValue',
  category: 'Special',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [100],
});

addFuncDef({
  name: 'changed',
  category: 'Special',
  params: [],
  defaultParams: [],
});

addFuncDef({
  name: 'scale',
  category: 'Transform',
  params: [{ name: 'factor', type: 'int' }],
  defaultParams: [1],
});

addFuncDef({
  name: 'offset',
  category: 'Transform',
  params: [{ name: 'amount', type: 'int' }],
  defaultParams: [10],
});

addFuncDef({
  name: 'transformNull',
  category: 'Transform',
  params: [{ name: 'amount', type: 'int' }],
  defaultParams: [0],
});

addFuncDef({
  name: 'integral',
  category: 'Transform',
});

addFuncDef({
  name: 'derivative',
  category: 'Transform',
});

addFuncDef({
  name: 'nonNegativeDerivative',
  category: 'Transform',
  params: [{ name: 'max value or 0', type: 'int', optional: true }],
  defaultParams: [''],
});

addFuncDef({
  name: 'timeShift',
  category: 'Transform',
  params: [
    {
      name: 'amount',
      type: 'select',
      options: ['1h', '6h', '12h', '1d', '2d', '7d', '14d', '30d'],
    },
  ],
  defaultParams: ['1d'],
});

addFuncDef({
  name: 'timeStack',
  category: 'Transform',
  params: [
    {
      name: 'timeShiftUnit',
      type: 'select',
      options: ['1h', '6h', '12h', '1d', '2d', '7d', '14d', '30d'],
    },
    { name: 'timeShiftStart', type: 'int' },
    { name: 'timeShiftEnd', type: 'int' },
  ],
  defaultParams: ['1d', 0, 7],
});

addFuncDef({
  name: 'summarize',
  category: 'Transform',
  params: [
    { name: 'interval', type: 'string' },
    {
      name: 'func',
      type: 'select',
      options: ['sum', 'avg', 'min', 'max', 'last'],
    },
    {
      name: 'alignToFrom',
      type: 'boolean',
      optional: true,
      options: ['false', 'true'],
    },
  ],
  defaultParams: ['1h', 'sum', 'false'],
});

addFuncDef({
  name: 'smartSummarize',
  category: 'Transform',
  params: [
    { name: 'interval', type: 'string' },
    {
      name: 'func',
      type: 'select',
      options: ['sum', 'avg', 'min', 'max', 'last'],
    },
  ],
  defaultParams: ['1h', 'sum'],
});

addFuncDef({
  name: 'absolute',
  category: 'Transform',
});

addFuncDef({
  name: 'hitcount',
  category: 'Transform',
  params: [{ name: 'interval', type: 'string' }],
  defaultParams: ['10s'],
});

addFuncDef({
  name: 'log',
  category: 'Transform',
  params: [{ name: 'base', type: 'int' }],
  defaultParams: ['10'],
});

addFuncDef({
  name: 'averageAbove',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [25],
});

addFuncDef({
  name: 'averageBelow',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [25],
});

addFuncDef({
  name: 'currentAbove',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [25],
});

addFuncDef({
  name: 'currentBelow',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [25],
});

addFuncDef({
  name: 'maximumAbove',
  category: 'Filter',
  params: [{ name: 'value', type: 'int' }],
  defaultParams: [0],
});

addFuncDef({
  name: 'maximumBelow',
  category: 'Filter',
  params: [{ name: 'value', type: 'int' }],
  defaultParams: [0],
});

addFuncDef({
  name: 'minimumAbove',
  category: 'Filter',
  params: [{ name: 'value', type: 'int' }],
  defaultParams: [0],
});

addFuncDef({
  name: 'minimumBelow',
  category: 'Filter',
  params: [{ name: 'value', type: 'int' }],
  defaultParams: [0],
});

addFuncDef({
  name: 'limit',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'mostDeviant',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [10],
});

addFuncDef({
  name: 'exclude',
  category: 'Filter',
  params: [{ name: 'exclude', type: 'string' }],
  defaultParams: ['exclude'],
});

addFuncDef({
  name: 'highestCurrent',
  category: 'Filter',
  params: [{ name: 'count', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'highestMax',
  category: 'Filter',
  params: [{ name: 'count', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'lowestCurrent',
  category: 'Filter',
  params: [{ name: 'count', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'movingAverage',
  category: 'Filter',
  params: [
    {
      name: 'windowSize',
      type: 'int_or_interval',
      options: ['5', '7', '10', '5min', '10min', '30min', '1hour'],
    },
  ],
  defaultParams: [10],
});

addFuncDef({
  name: 'movingMedian',
  category: 'Filter',
  params: [
    {
      name: 'windowSize',
      type: 'int_or_interval',
      options: ['5', '7', '10', '5min', '10min', '30min', '1hour'],
    },
  ],
  defaultParams: ['5'],
});

addFuncDef({
  name: 'stdev',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }, { name: 'tolerance', type: 'int' }],
  defaultParams: [5, 0.1],
});

addFuncDef({
  name: 'highestAverage',
  category: 'Filter',
  params: [{ name: 'count', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'lowestAverage',
  category: 'Filter',
  params: [{ name: 'count', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'removeAbovePercentile',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'removeAboveValue',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'removeBelowPercentile',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'removeBelowValue',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [5],
});

addFuncDef({
  name: 'useSeriesAbove',
  category: 'Filter',
  params: [{ name: 'value', type: 'int' }, { name: 'search', type: 'string' }, { name: 'replace', type: 'string' }],
  defaultParams: [0, 'search', 'replace'],
});

////////////////////
// Graphite 1.0.x //
////////////////////

addFuncDef({
  name: 'aggregateLine',
  category: 'Combine',
  params: [
    {
      name: 'func',
      type: 'select',
      options: ['sum', 'avg', 'min', 'max', 'last'],
    },
  ],
  defaultParams: ['avg'],
  version: '1.0',
});

addFuncDef({
  name: 'averageOutsidePercentile',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [95],
  version: '1.0',
});

addFuncDef({
  name: 'delay',
  category: 'Transform',
  params: [{ name: 'steps', type: 'int' }],
  defaultParams: [1],
  version: '1.0',
});

addFuncDef({
  name: 'exponentialMovingAverage',
  category: 'Calculate',
  params: [
    {
      name: 'windowSize',
      type: 'int_or_interval',
      options: ['5', '7', '10', '5min', '10min', '30min', '1hour'],
    },
  ],
  defaultParams: [10],
  version: '1.0',
});

addFuncDef({
  name: 'fallbackSeries',
  category: 'Special',
  params: [{ name: 'fallback', type: 'string' }],
  defaultParams: ['constantLine(0)'],
  version: '1.0',
});

addFuncDef({
  name: 'grep',
  category: 'Filter',
  params: [{ name: 'grep', type: 'string' }],
  defaultParams: ['grep'],
  version: '1.0',
});

addFuncDef({
  name: 'groupByNodes',
  category: 'Special',
  params: [
    {
      name: 'function',
      type: 'string',
      options: ['sum', 'avg', 'maxSeries'],
    },
    {
      name: 'node',
      type: 'int',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
      multiple: true,
    },
  ],
  defaultParams: ['sum', 3],
  version: '1.0',
});

addFuncDef({
  name: 'integralByInterval',
  category: 'Transform',
  params: [
    {
      name: 'intervalUnit',
      type: 'select',
      options: ['1h', '6h', '12h', '1d', '2d', '7d', '14d', '30d'],
    },
  ],
  defaultParams: ['1d'],
  version: '1.0',
});

addFuncDef({
  name: 'interpolate',
  category: 'Transform',
  params: [{ name: 'limit', type: 'int', optional: true }],
  defaultParams: [],
  version: '1.0',
});

addFuncDef({
  name: 'invert',
  category: 'Transform',
  version: '1.0',
});

addFuncDef({
  name: 'isNonNull',
  category: 'Combine',
  version: '1.0',
});

addFuncDef({
  name: 'linearRegression',
  category: 'Calculate',
  params: [
    {
      name: 'startSourceAt',
      type: 'select',
      options: ['-1h', '-6h', '-12h', '-1d', '-2d', '-7d', '-14d', '-30d'],
      optional: true,
    },
    {
      name: 'endSourceAt',
      type: 'select',
      options: ['-1h', '-6h', '-12h', '-1d', '-2d', '-7d', '-14d', '-30d'],
      optional: true,
    },
  ],
  defaultParams: [],
  version: '1.0',
});

addFuncDef({
  name: 'mapSeries',
  shortName: 'map',
  params: [{ name: 'node', type: 'int' }],
  defaultParams: [3],
  category: 'Combine',
  version: '1.0',
});

addFuncDef({
  name: 'movingMin',
  category: 'Calculate',
  params: [
    {
      name: 'windowSize',
      type: 'int_or_interval',
      options: ['5', '7', '10', '5min', '10min', '30min', '1hour'],
    },
  ],
  defaultParams: [10],
  version: '1.0',
});

addFuncDef({
  name: 'movingMax',
  category: 'Calculate',
  params: [
    {
      name: 'windowSize',
      type: 'int_or_interval',
      options: ['5', '7', '10', '5min', '10min', '30min', '1hour'],
    },
  ],
  defaultParams: [10],
  version: '1.0',
});

addFuncDef({
  name: 'movingSum',
  category: 'Calculate',
  params: [
    {
      name: 'windowSize',
      type: 'int_or_interval',
      options: ['5', '7', '10', '5min', '10min', '30min', '1hour'],
    },
  ],
  defaultParams: [10],
  version: '1.0',
});

addFuncDef({
  name: 'multiplySeriesWithWildcards',
  category: 'Calculate',
  params: [
    {
      name: 'position',
      type: 'int',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
      multiple: true,
    },
  ],
  defaultParams: [2],
  version: '1.0',
});

addFuncDef({
  name: 'offsetToZero',
  category: 'Transform',
  version: '1.0',
});

addFuncDef({
  name: 'pow',
  category: 'Transform',
  params: [{ name: 'factor', type: 'int' }],
  defaultParams: [10],
  version: '1.0',
});

addFuncDef({
  name: 'powSeries',
  category: 'Transform',
  params: optionalSeriesRefArgs,
  defaultParams: [''],
  version: '1.0',
});

addFuncDef({
  name: 'reduceSeries',
  shortName: 'reduce',
  params: [
    {
      name: 'function',
      type: 'string',
      options: ['asPercent', 'diffSeries', 'divideSeries'],
    },
    {
      name: 'reduceNode',
      type: 'int',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    },
    { name: 'reduceMatchers', type: 'string', multiple: true },
  ],
  defaultParams: ['asPercent', 2, 'used_bytes'],
  category: 'Combine',
  version: '1.0',
});

addFuncDef({
  name: 'removeBetweenPercentile',
  category: 'Filter',
  params: [{ name: 'n', type: 'int' }],
  defaultParams: [95],
  version: '1.0',
});

addFuncDef({
  name: 'removeEmptySeries',
  category: 'Filter',
  version: '1.0',
});

addFuncDef({
  name: 'squareRoot',
  category: 'Transform',
  version: '1.0',
});

addFuncDef({
  name: 'timeSlice',
  category: 'Transform',
  params: [
    {
      name: 'startSliceAt',
      type: 'select',
      options: ['-1h', '-6h', '-12h', '-1d', '-2d', '-7d', '-14d', '-30d'],
    },
    {
      name: 'endSliceAt',
      type: 'select',
      options: ['-1h', '-6h', '-12h', '-1d', '-2d', '-7d', '-14d', '-30d'],
      optional: true,
    },
  ],
  defaultParams: ['-1h'],
  version: '1.0',
});

addFuncDef({
  name: 'weightedAverage',
  category: 'Filter',
  params: [
    { name: 'other', type: 'value_or_series', optional: true },
    {
      name: 'node',
      type: 'int',
      options: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12],
    },
  ],
  defaultParams: ['#A', 4],
  version: '1.0',
});

addFuncDef({
  name: 'seriesByTag',
  category: 'Special',
  params: [{ name: 'tagExpression', type: 'string', multiple: true }],
  version: '1.1',
});

addFuncDef({
  name: 'groupByTags',
  category: 'Special',
  params: [
    {
      name: 'function',
      type: 'string',
      options: ['sum', 'avg', 'maxSeries'],
    },
    { name: 'tag', type: 'string', multiple: true },
  ],
  defaultParams: ['sum', 'tag'],
  version: '1.1',
});

addFuncDef({
  name: 'aliasByTags',
  category: 'Special',
  params: [{ name: 'tag', type: 'string', multiple: true }],
  defaultParams: ['tag'],
  version: '1.1',
});

function isVersionRelatedFunction(obj, graphiteVersion) {
  return !obj.version || isVersionGtOrEq(graphiteVersion, obj.version);
}

export class FuncInstance {
  def: any;
  params: any;
  text: any;
  added: boolean;

  constructor(funcDef, options) {
    this.def = funcDef;
    this.params = [];

    if (options && options.withDefaultParams) {
      this.params = funcDef.defaultParams.slice(0);
    }

    this.updateText();
  }

  render(metricExp) {
    var str = this.def.name + '(';

    var parameters = _.map(
      this.params,
      function(value, index) {
        var paramType;
        if (index < this.def.params.length) {
          paramType = this.def.params[index].type;
        } else if (_.get(_.last(this.def.params), 'multiple')) {
          paramType = _.get(_.last(this.def.params), 'type');
        }
        if (paramType === 'value_or_series') {
          return value;
        }
        if (paramType === 'boolean' && _.includes(['true', 'false'], value)) {
          return value;
        }
        if (_.includes(['int', 'float', 'int_or_interval', 'node_or_tag', 'node'], paramType) && _.isFinite(+value)) {
          return _.toString(+value);
        }
        return "'" + value + "'";
      }.bind(this)
    );

    // don't send any blank parameters to graphite
    while (parameters[parameters.length - 1] === '') {
      parameters.pop();
    }

    if (metricExp) {
      parameters.unshift(metricExp);
    }

    return str + parameters.join(', ') + ')';
  }

  _hasMultipleParamsInString(strValue, index) {
    if (strValue.indexOf(',') === -1) {
      return false;
    }

    if (this.def.params[index + 1] && this.def.params[index + 1].optional) {
      return true;
    }

    if (index + 1 >= this.def.params.length && _.get(_.last(this.def.params), 'multiple')) {
      return true;
    }

    return false;
  }

  updateParam(strValue, index) {
    // handle optional parameters
    // if string contains ',' and next param is optional, split and update both
    if (this._hasMultipleParamsInString(strValue, index)) {
      _.each(
        strValue.split(','),
        function(partVal, idx) {
          this.updateParam(partVal.trim(), index + idx);
        }.bind(this)
      );
      return;
    }

    if (strValue === '' && (index >= this.def.params.length || this.def.params[index].optional)) {
      this.params.splice(index, 1);
    } else {
      this.params[index] = strValue;
    }

    this.updateText();
  }

  updateText() {
    if (this.params.length === 0) {
      this.text = this.def.name + '()';
      return;
    }

    var text = this.def.name + '(';
    text += this.params.join(', ');
    text += ')';
    this.text = text;
  }
}

function createFuncInstance(funcDef, options?, idx?) {
  if (_.isString(funcDef)) {
    funcDef = getFuncDef(funcDef, idx);
  }
  return new FuncInstance(funcDef, options);
}

function getFuncDef(name, idx?) {
  if (!(idx || index)[name]) {
    throw { message: 'Method not found ' + name };
  }
  return (idx || index)[name];
}

function getFuncDefs(graphiteVersion, idx?) {
  var funcs = {};
  _.forEach(idx || index, function(funcDef) {
    if (isVersionRelatedFunction(funcDef, graphiteVersion)) {
      funcs[funcDef.name] = _.assign({}, funcDef, {
        params: _.filter(funcDef.params, function(param) {
          return isVersionRelatedFunction(param, graphiteVersion);
        }),
      });
    }
  });
  return funcs;
}

export default {
  createFuncInstance: createFuncInstance,
  getFuncDef: getFuncDef,
  getFuncDefs: getFuncDefs,
};
