export const connectionResourcePageLimit = 50;

export interface ConnectionResource {
  resource_id: number;
  resource_uuid: string;
  resource_name: string;
  resource_type: string;
}

export interface ConnectionResourcesState {
  connectionResources: ConnectionResource[];
  connectionResourcesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}
