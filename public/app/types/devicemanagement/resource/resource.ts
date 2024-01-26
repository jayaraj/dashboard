export const resourcesPageLimit = 50;
export interface Resource {
  id: number;
  type: string;
  image_url: string;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
  tags: string;
  online_status: boolean;
  last_seen: string;
}

export interface CreateResourceDTO {
  type: string;
  image_url: string;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
  tags: string[];
}

export interface UpdateResourceDTO {
  name: string;
  uuid: string;
  image_url: string;
  latitude: number;
  longitude: number;
  tags: string[];
  type: string;
}

export interface ResourcesState {
  resources: Resource[];
  resourcesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface ResourceState {
  resource: Resource;
}
