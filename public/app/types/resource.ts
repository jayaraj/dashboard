import { ResourceType } from "./resourceType";

export interface Resource {
  id: number;
  type: string;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface ResourcesState {
  resources: Resource[];
  resourcesCount: number;
  searchQuery: string;
  page: number;
  hasFetched: boolean;
}

export interface ResourceState {
  resource: Resource;
  groups: ResourceGroup[];
  groupSearchQuery: string;
  groupsCount: number;
  groupsPage: number;
  hasFetched: boolean;
  data: any;
  type: ResourceType;
}

export interface ResourceGroup {
  id: number;
  group_id: number;
  group_name: string;
  group_path: string;
}
