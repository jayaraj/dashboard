import { OrgRole, SelectableValue } from '@grafana/data';
import { FormElement, LayoutSection } from "app/core/components/CustomForm/types";

export const configurationTypePageLimit = 50;
export const associationTypes: Array<SelectableValue<string>> = [
  {
    label: 'Org',
    value: 'org',
    description: `Org configuration type`,
  },
  {
    label: 'Group',
    value: 'group',
    description: `Group configuration type`,
  },
  {
    label: 'Resource',
    value: 'resource',
    description: `Resource configuration type`,
  },
];

export const configurationRoles = [
  { label: 'Viewer', value: OrgRole.Viewer },
  { label: 'Editor', value: OrgRole.Editor },
  { label: 'Admin', value: OrgRole.Admin },
  { label: 'SuperAdmin', value: OrgRole.SuperAdmin },
];

export interface ConfigurationType {
  id: number;
  updated_at: string;
  associated_with: string;
  type: string;
  measurement: boolean;
  role: OrgRole; 
  configuration: Configuration;
}

export interface CreateConfigurationTypeDTO {
  associated_with: string;
  type: string;
  measurement: boolean;
  role: OrgRole; 
  configuration: Configuration;
}

export interface UpdateConfigurationTypeDTO {
  associated_with: string;
  type: string;
  measurement: boolean;
  role: OrgRole; 
  configuration: Configuration;
}

export interface ConfigurationTypesState {
  configurationTypes: ConfigurationType[];
  configurationTypesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface ConfigurationTypeState {
  configurationType: ConfigurationType;
}

export interface Configuration {
  sections: LayoutSection[];
  elements: FormElement[];
}
