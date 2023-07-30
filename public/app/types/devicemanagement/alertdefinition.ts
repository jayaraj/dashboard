
import { OrgRole, SelectableValue } from '@grafana/data';
import { Configuration } from './configurationType';

export const alertDefinitionPageLimit = 50;
export const severityTypes: Array<SelectableValue<string>> = [
  {
    label: 'Minor',
    value: 'minor',
    description: `Minor Alert`,
  },
  {
    label: 'Major',
    value: 'major',
    description: `Major Alert`,
  },
  {
    label: 'Critical',
    value: 'critical',
    description: `Critical Alert`,
  },
];

export interface AlertStats {
  count: number;
  alerting: number;
  pending: number;
  normal: number;
}

export interface AlertDefinition {
  id: number;
  updated_at: string;
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  associated_with: string;
  role: OrgRole;
  severity: string;
  for: number;
  ticket_enabled: boolean;
  configuration: Configuration;
  alerting: number;
  pending: number;
  normal: number;
  onEdit?: () => void;
}

export interface UpdateAlertDefinitionDTO {
  name: string;
  description: string;
  alerting_msg: string;
  ok_msg: string;
  associated_with: string;
  role: OrgRole;
  severity: string;
  for: number;
  ticket_enabled: boolean;
  configuration: Configuration;
}

export interface AlertDefinitionsState {
  alertDefinitions: AlertDefinition[];
  alertDefinitionsStats: AlertStats;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface AlertDefinitionState {
  alertDefinition: AlertDefinition;
}