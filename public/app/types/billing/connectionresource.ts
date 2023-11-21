export const connectionResourcePageLimit = 50;

export interface ConnectionResource {
  resource_id: number;
  resource_uuid: string;
  resource_name: string;
  resource_type: string;
  resource_tags: string;
  resource_profile: string;
}

export interface ConnectionResourcesState {
  connectionResources: ConnectionResource[];
  connectionResourcesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface CreateConnectionResourceDTO {
  type: string;
  image_url: string;
  uuid: string;
  name: string;
  latitude: number;
  longitude: number;
  tags: string[];
}