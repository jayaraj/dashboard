
export interface ResourceConfiguration {
  id: number;
  resource_id: number;
  type: string;
  configuration: any;
}

export interface ResourceConfigurationState {
  configuration: ResourceConfiguration;
}