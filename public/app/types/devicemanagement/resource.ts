
export const resourcePageLimit = 50;
export interface Resource {
  id: number;
  type: string;
  image_url: string;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface CreateResourceDTO {
  type: string;
  image_url: string;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
}

export interface UpdateResourceDTO {
  name: string;
  uuid: string;
  image_url: string;
  latitude: number;
  longitude: number;
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
