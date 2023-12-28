import { ResourceConfigurationState } from 'app/types/devicemanagement/configuration';
import { Resource, ResourceGroupsState, ResourcesState, ResourceState } from 'app/types/devicemanagement/resource';

export const getResourcesSearchQuery = (state: ResourcesState) => state.searchQuery;
export const getResourcesSearchPage = (state: ResourcesState) => state.searchPage;
export const getResourcesCount = (state: ResourcesState) => state.resourcesCount;
export const getResourceGroupsSearchQuery = (state: ResourceGroupsState) => state.searchQuery;
export const getResourceGroupsCount = (state: ResourceGroupsState) => state.resourceGroupsCount;
export const getResourceGroupsSearchPage = (state: ResourceGroupsState) => state.searchPage;
export const getResourceConfiguration = (state: ResourceConfigurationState) => state.configuration;
export const getResources = (state: ResourcesState) => state.resources;
export const getResourceGroups = (state: ResourceGroupsState) => state.resourceGroups;

export const getResource = (state: ResourceState, currentResourceId: any): Resource | null => {
  if (state.resource.id === parseInt(currentResourceId, 10)) {
    return state.resource;
  }
  return null;
};
