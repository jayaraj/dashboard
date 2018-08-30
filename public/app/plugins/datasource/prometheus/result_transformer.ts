import _ from 'lodash';
import TableModel from 'app/core/table_model';

export class ResultTransformer {
  constructor(private templateSrv) {}

  transform(response: any, options: any): any[] {
    const prometheusResult = response.data.data.result;

    if (options.format === 'table') {
      return [this.transformMetricDataToTable(prometheusResult, options.responseListLength, options.refId)];
    } else if (options.format === 'heatmap') {
      let seriesList = [];
      prometheusResult.sort(sortSeriesByLabel);
      for (const metricData of prometheusResult) {
        seriesList.push(this.transformMetricData(metricData, options, options.start, options.end));
      }
      seriesList = this.transformToHistogramOverTime(seriesList);
      return seriesList;
    } else {
      const seriesList = [];
      for (const metricData of prometheusResult) {
        if (response.data.data.resultType === 'matrix') {
          seriesList.push(this.transformMetricData(metricData, options, options.start, options.end));
        } else if (response.data.data.resultType === 'vector') {
          seriesList.push(this.transformInstantMetricData(metricData, options));
        }
      }
      return seriesList;
    }
    return [];
  }

  transformMetricData(metricData, options, start, end) {
    const dps = [];
    let metricLabel = null;

    metricLabel = this.createMetricLabel(metricData.metric, options);

    const stepMs = parseInt(options.step) * 1000;
    let baseTimestamp = start * 1000;

    if (metricData.values === undefined) {
      throw new Error('Prometheus heatmap error: data should be a time series');
    }

    for (const value of metricData.values) {
      let dp_value = parseFloat(value[1]);
      if (_.isNaN(dp_value)) {
        dp_value = null;
      }

      const timestamp = parseFloat(value[0]) * 1000;
      for (let t = baseTimestamp; t < timestamp; t += stepMs) {
        dps.push([null, t]);
      }
      baseTimestamp = timestamp + stepMs;
      dps.push([dp_value, timestamp]);
    }

    const endTimestamp = end * 1000;
    for (let t = baseTimestamp; t <= endTimestamp; t += stepMs) {
      dps.push([null, t]);
    }

    return {
      datapoints: dps,
      query: options.query,
      responseIndex: options.responseIndex,
      target: metricLabel,
    };
  }

  transformMetricDataToTable(md, resultCount: number, refId: string) {
    const table = new TableModel();
    let i, j;
    const metricLabels = {};

    if (md.length === 0) {
      return table;
    }

    // Collect all labels across all metrics
    _.each(md, function(series) {
      for (const label in series.metric) {
        if (!metricLabels.hasOwnProperty(label)) {
          metricLabels[label] = 1;
        }
      }
    });

    // Sort metric labels, create columns for them and record their index
    const sortedLabels = _.keys(metricLabels).sort();
    table.columns.push({ text: 'Time', type: 'time' });
    _.each(sortedLabels, function(label, labelIndex) {
      metricLabels[label] = labelIndex + 1;
      table.columns.push({ text: label, filterable: !label.startsWith('__') });
    });
    const valueText = resultCount > 1 ? `Value #${refId}` : 'Value';
    table.columns.push({ text: valueText });

    // Populate rows, set value to empty string when label not present.
    _.each(md, function(series) {
      if (series.value) {
        series.values = [series.value];
      }
      if (series.values) {
        for (i = 0; i < series.values.length; i++) {
          const values = series.values[i];
          const reordered: any = [values[0] * 1000];
          if (series.metric) {
            for (j = 0; j < sortedLabels.length; j++) {
              const label = sortedLabels[j];
              if (series.metric.hasOwnProperty(label)) {
                reordered.push(series.metric[label]);
              } else {
                reordered.push('');
              }
            }
          }
          reordered.push(parseFloat(values[1]));
          table.rows.push(reordered);
        }
      }
    });

    return table;
  }

  transformInstantMetricData(md, options) {
    const dps = [];
    let metricLabel = null;
    metricLabel = this.createMetricLabel(md.metric, options);
    dps.push([parseFloat(md.value[1]), md.value[0] * 1000]);
    return { target: metricLabel, datapoints: dps, labels: md.metric };
  }

  createMetricLabel(labelData, options) {
    let label = '';
    if (_.isUndefined(options) || _.isEmpty(options.legendFormat)) {
      label = this.getOriginalMetricName(labelData);
    } else {
      label = this.renderTemplate(this.templateSrv.replace(options.legendFormat), labelData);
    }
    if (!label || label === '{}') {
      label = options.query;
    }
    return label;
  }

  renderTemplate(aliasPattern, aliasData) {
    const aliasRegex = /\{\{\s*(.+?)\s*\}\}/g;
    return aliasPattern.replace(aliasRegex, function(match, g1) {
      if (aliasData[g1]) {
        return aliasData[g1];
      }
      return g1;
    });
  }

  getOriginalMetricName(labelData) {
    const metricName = labelData.__name__ || '';
    delete labelData.__name__;
    const labelPart = _.map(_.toPairs(labelData), function(label) {
      return label[0] + '="' + label[1] + '"';
    }).join(',');
    return metricName + '{' + labelPart + '}';
  }

  transformToHistogramOverTime(seriesList) {
    /*      t1 = timestamp1, t2 = timestamp2 etc.
            t1  t2  t3          t1  t2  t3
    le10    10  10  0     =>    10  10  0
    le20    20  10  30    =>    10  0   30
    le30    30  10  35    =>    10  0   5
    */
    for (let i = seriesList.length - 1; i > 0; i--) {
      const topSeries = seriesList[i].datapoints;
      const bottomSeries = seriesList[i - 1].datapoints;
      if (!topSeries || !bottomSeries) {
        throw new Error('Prometheus heatmap transform error: data should be a time series');
      }

      for (let j = 0; j < topSeries.length; j++) {
        const bottomPoint = bottomSeries[j] || [0];
        topSeries[j][0] -= bottomPoint[0];
      }
    }

    return seriesList;
  }
}

function sortSeriesByLabel(s1, s2): number {
  let le1, le2;

  try {
    // fail if not integer. might happen with bad queries
    le1 = parseHistogramLabel(s1.metric.le);
    le2 = parseHistogramLabel(s2.metric.le);
  } catch (err) {
    console.log(err);
    return 0;
  }

  if (le1 > le2) {
    return 1;
  }

  if (le1 < le2) {
    return -1;
  }

  return 0;
}

function parseHistogramLabel(le: string): number {
  if (le === '+Inf') {
    return +Infinity;
  }
  return Number(le);
}
