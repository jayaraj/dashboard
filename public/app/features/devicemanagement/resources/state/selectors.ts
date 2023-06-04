import { Resource, ResourceConfigurationState, ResourceGroupsState, ResourcesState, ResourceState } from 'app/types';

export const getResourcesSearchQuery = (state: ResourcesState) => state.searchQuery;
export const getResourcesSearchPage = (state: ResourcesState) => state.searchPage;
export const getResourcesCount = (state: ResourcesState) => state.resourcesCount;
export const getResourceGroupsSearchQuery = (state: ResourceGroupsState) => state.searchQuery;
export const getResourceGroupsCount = (state: ResourceGroupsState) => state.resourceGroupsCount;
export const getResourceGroupsSearchPage = (state: ResourceGroupsState) => state.searchPage;
export const getResourceConfiguration = (state: ResourceConfigurationState) => state.configuration;

export const getResource = (state: ResourceState, currentResourceId: any): Resource | null => {
  if (state.resource.id === parseInt(currentResourceId, 10)) {
    return state.resource;
  }
  return null;
};

export const getResources = (state: ResourcesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.resources.filter((resource) => {
    return regex.test(resource.name);
  });
};

export const getResourceGroups = (state: ResourceGroupsState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.resourceGroups.filter((group) => {
    return regex.test(group.group_name);
  });
};
