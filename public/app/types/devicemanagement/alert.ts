import { OrgRole } from '@grafana/data';
import { AlertStats } from './alertdefinition';

export const alertPageLimit = 50;
export const ALERT_POLL_INTERVAL_MS = 60000;

export enum AlertingState {
  Alerting = 'alerting',
  Normal = 'normal',
  Pending = 'pending',
}

export interface FilterState {
  queryString?: string;
  alertState?: string;
  association?: string;
}

export interface Alert {
  id: number;
  updated_at: string;
  alert_definition_id: number;
  name: string;
  org_id: number;
  group_path: string;
  resource_id: number;
  state: string;
  message: string;
  description: string;
  associated_with: string;
  role: OrgRole;
  severity: string;
  for: number;
  ticket_enabled: boolean;
  enabled: boolean;
  data: any;
  configuration: any;
  onEdit?: () => void;
  setConfiguringAlert: (alert: Alert) => void;
}

export interface AlertsState {
  alertsByName: Record<string, Alert[]>;
  alertsByState: Record<AlertingState, Alert[]>;
  alertsByNameStats: Record<string, AlertStats>;
  alertsByNameHasFetched: Record<string, boolean>;
  alertsByStateStats: Record<AlertingState, AlertStats>;
  alertsByStateHasFetched: Record<AlertingState, boolean>;
  alertsByNamePage: Record<string, number>;
  alertsByStatePage: Record<AlertingState, number>;
}

export interface AlertState {
  alert: Alert;
}