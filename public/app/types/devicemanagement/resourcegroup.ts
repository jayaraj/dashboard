
export const resourceGroupPageLimit = 50;
export interface ResourceGroup {
  id: number;
  group_id: number;
  group_name: string;
  group_path: string;
}

export interface ResourceGroupsState {
  resourceGroups: ResourceGroup[];
  resourceGroupsCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}