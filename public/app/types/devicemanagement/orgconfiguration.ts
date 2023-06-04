
export interface OrgConfiguration {
  id: number;
  org_id: number;
  type: string;
  configuration: any;
}

export interface OrgConfigurationState {
  configuration: OrgConfiguration;
}