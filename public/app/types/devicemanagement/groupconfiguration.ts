

export interface GroupConfiguration {
  id: number;
  group_id: number;
  type: string;
  configuration: any;
}

export interface GroupConfigurationState {
  configuration: GroupConfiguration;
}