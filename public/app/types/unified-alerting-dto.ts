// Prometheus API DTOs, possibly to be autogenerated from openapi spec in the near future

import { DataQuery, RelativeTimeRange } from '@grafana/data';

export type Labels = Record<string, string>;
export type Annotations = Record<string, string>;

export enum PromAlertingRuleState {
  Firing = 'firing',
  Inactive = 'inactive',
  Pending = 'pending',
}

export enum GrafanaAlertState {
  Normal = 'Normal',
  Alerting = 'Alerting',
  Pending = 'Pending',
  NoData = 'NoData',
  Error = 'Error',
}

export enum PromRuleType {
  Alerting = 'alerting',
  Recording = 'recording',
}

interface PromRuleDTOBase {
  health: string;
  name: string;
  query: string; // expr
  evaluationTime?: number;
  lastEvaluation?: string;
  lastError?: string;
}

export interface PromAlertingRuleDTO extends PromRuleDTOBase {
  alerts: Array<{
    labels: Labels;
    annotations: Annotations;
    state: Exclude<PromAlertingRuleState | GrafanaAlertState, PromAlertingRuleState.Inactive>;
    activeAt: string;
    value: string;
  }>;
  labels: Labels;
  annotations?: Annotations;
  duration?: number; // for
  state: PromAlertingRuleState;
  type: PromRuleType.Alerting;
}

export interface PromRecordingRuleDTO extends PromRuleDTOBase {
  health: string;
  name: string;
  query: string; // expr
  type: PromRuleType.Recording;
  labels?: Labels;
}

export type PromRuleDTO = PromAlertingRuleDTO | PromRecordingRuleDTO;

export interface PromRuleGroupDTO {
  name: string;
  file: string;
  rules: PromRuleDTO[];
  interval: number;

  evaluationTime?: number; // these 2 are not in older prometheus payloads
  lastEvaluation?: string;
}

export interface PromResponse<T> {
  status: 'success' | 'error' | ''; // mocks return empty string
  data: T;
  errorType?: string;
  error?: string;
  warnings?: string[];
}

export type PromRulesResponse = PromResponse<{ groups: PromRuleGroupDTO[] }>;

// Ruler rule DTOs
interface RulerRuleBaseDTO {
  expr: string;
  labels?: Labels;
}

export interface RulerRecordingRuleDTO extends RulerRuleBaseDTO {
  record: string;
}

export interface RulerAlertingRuleDTO extends RulerRuleBaseDTO {
  alert: string;
  for?: string;
  annotations?: Annotations;
}

export enum GrafanaAlertStateDecision {
  Alerting = 'Alerting',
  NoData = 'NoData',
  KeepLastState = 'KeepLastState',
  OK = 'OK',
  Error = 'Error',
}

export interface AlertDataQuery extends DataQuery {
  maxDataPoints?: number;
  intervalMs?: number;
}

export interface AlertQuery {
  refId: string;
  queryType: string;
  relativeTimeRange?: RelativeTimeRange;
  datasourceUid: string;
  model: AlertDataQuery;
}

export interface PostableGrafanaRuleDefinition {
  uid?: string;
  title: string;
  condition: string;
  no_data_state: GrafanaAlertStateDecision;
  exec_err_state: GrafanaAlertStateDecision;
  data: AlertQuery[];
}
export interface GrafanaRuleDefinition extends PostableGrafanaRuleDefinition {
  id?: string;
  uid: string;
  namespace_uid: string;
  namespace_id: number;
}

export interface RulerGrafanaRuleDTO {
  grafana_alert: GrafanaRuleDefinition;
  for: string;
  annotations: Annotations;
  labels: Labels;
}

export interface PostableRuleGrafanaRuleDTO {
  grafana_alert: PostableGrafanaRuleDefinition;
  for: string;
  annotations: Annotations;
  labels: Labels;
}

export type RulerRuleDTO = RulerAlertingRuleDTO | RulerRecordingRuleDTO | RulerGrafanaRuleDTO;

export type PostableRuleDTO = RulerAlertingRuleDTO | RulerRecordingRuleDTO | PostableRuleGrafanaRuleDTO;

export type RulerRuleGroupDTO<R = RulerRuleDTO> = {
  name: string;
  interval?: string;
  rules: R[];
};

export type PostableRulerRuleGroupDTO = RulerRuleGroupDTO<PostableRuleDTO>;

export type RulerRulesConfigDTO = { [namespace: string]: RulerRuleGroupDTO[] };
