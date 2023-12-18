export const groupResourcesPageLimit = 50;
export interface GroupResource {
  id: number;
  resource_id: number;
  resource_uuid: string;
  resource_name: string;
  resource_type: string;
  resource_tags: string;
}

export interface GroupResourcesState {
  groupResources: GroupResource[];
  groupResourcesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}
