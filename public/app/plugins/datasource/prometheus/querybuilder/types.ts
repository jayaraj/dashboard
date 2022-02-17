import { CoreApp } from '@grafana/data';
import { LegendFormatMode, PromQuery } from '../types';
import { VisualQueryBinary } from './shared/LokiAndPromQueryModellerBase';
import { QueryBuilderLabelFilter, QueryBuilderOperation, QueryEditorMode } from './shared/types';

/**
 * Visual query model
 */
export interface PromVisualQuery {
  metric: string;
  labels: QueryBuilderLabelFilter[];
  operations: QueryBuilderOperation[];
  binaryQueries?: PromVisualQueryBinary[];
}

export type PromVisualQueryBinary = VisualQueryBinary<PromVisualQuery>;

export enum PromVisualQueryOperationCategory {
  Aggregations = 'Aggregations',
  RangeFunctions = 'Range functions',
  Functions = 'Functions',
  BinaryOps = 'Binary operations',
  Trigonometric = 'Trigonometric',
  Time = 'Time Functions',
}

export enum PromOperationId {
  Abs = 'abs',
  Absent = 'absent',
  AbsentOverTime = 'absent_over_time',
  Acos = 'acos',
  Acosh = 'acosh',
  Asin = 'asin',
  Asinh = 'asinh',
  Atan = 'atan',
  Atanh = 'atanh',
  Avg = 'avg',
  AvgOverTime = 'avg_over_time',
  BottomK = 'bottomk',
  Ceil = 'ceil',
  Changes = 'changes',
  Clamp = 'clamp',
  ClampMax = 'clamp_max',
  ClampMin = 'clamp_min',
  Cos = 'cos',
  Cosh = 'cosh',
  Count = 'count',
  CountOverTime = 'count_over_time',
  CountScalar = 'count_scalar',
  CountValues = 'count_values',
  DayOfMonth = 'day_of_month',
  DayOfWeek = 'day_of_week',
  DaysInMonth = 'days_in_month',
  Deg = 'deg',
  Delta = 'delta',
  Deriv = 'deriv',
  DropCommonLabels = 'drop_common_labels',
  Exp = 'exp',
  Floor = 'floor',
  Group = 'group',
  HistogramQuantile = 'histogram_quantile',
  HoltWinters = 'holt_winters',
  Hour = 'hour',
  Idelta = 'idelta',
  Increase = 'increase',
  Irate = 'irate',
  LabelJoin = 'label_join',
  LabelReplace = 'label_replace',
  Last = 'last',
  LastOverTime = 'last_over_time',
  Ln = 'ln',
  Log10 = 'log10',
  Log2 = 'log2',
  Max = 'max',
  MaxOverTime = 'max_over_time',
  Min = 'min',
  MinOverTime = 'min_over_time',
  Minute = 'minute',
  Month = 'month',
  Pi = 'pi',
  PredictLinear = 'predict_linear',
  Present = 'present',
  PresentOverTime = 'present_over_time',
  Quantile = 'quantile',
  QuantileOverTime = 'quantile_over_time',
  Rad = 'rad',
  Rate = 'rate',
  Resets = 'resets',
  Round = 'round',
  Scalar = 'scalar',
  Sgn = 'sgn',
  Sin = 'sin',
  Sinh = 'sinh',
  Sort = 'sort',
  SortDesc = 'sort_desc',
  Sqrt = 'sqrt',
  Stddev = 'stddev',
  StddevOverTime = 'stddev_over_time',
  Sum = 'sum',
  SumOverTime = 'sum_over_time',
  Tan = 'tan',
  Tanh = 'tanh',
  Time = 'time',
  Timestamp = 'timestamp',
  Topk = 'topk',
  Vector = 'vector',
  Year = 'year',
  MultiplyBy = '__multiply_by',
  DivideBy = '__divide_by',
  NestedQuery = '__nested_query',
}

export interface PromQueryPattern {
  name: string;
  operations: QueryBuilderOperation[];
}

/**
 * Returns query with defaults, and boolean true/false depending on change was required
 */
export function getQueryWithDefaults(query: PromQuery, app: CoreApp | undefined): PromQuery {
  // If no expr (ie new query) then default to builder
  let result = query;
  const editorMode = query.editorMode ?? (query.expr ? QueryEditorMode.Code : QueryEditorMode.Builder);

  if (result.editorMode !== editorMode) {
    result = { ...result, editorMode };
  }

  if (query.expr == null) {
    result = { ...result, expr: '', legendFormat: LegendFormatMode.Auto };
  }

  // Default to range query
  if (query.range == null) {
    result = { ...result, range: true };
  }

  // In explore we default to both instant & range
  if (query.instant == null && app === CoreApp.Explore) {
    result = { ...result, instant: true };
  }

  return result;
}
