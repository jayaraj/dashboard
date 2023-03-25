import { ResourceConfiguration } from "./groupType";

export interface ResourceType {
  id: number;
  type: string;
  configuration: ResourceConfiguration;
}

export interface ResourceTypesState {
  resourceTypes: ResourceType[];
  resourceTypesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface ResourceTypeState {
  resourceType: ResourceType;
}
