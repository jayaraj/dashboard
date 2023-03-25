import { Resource, ResourcesState, ResourceState } from 'app/types';

export const getSearchQuery = (state: ResourcesState) => state.searchQuery;
export const getResourcesPage = (state: ResourcesState) => state.page;
export const getResourcesCount = (state: ResourcesState) => state.resourcesCount;
export const getGroupSearchQuery = (state: ResourceState) => state.groupSearchQuery;
export const getGroupsCount = (state: ResourceState) => state.groupsCount;
export const getGroupsPage = (state: ResourceState) => state.groupsPage;
export const getResourceId = (state: ResourceState) => state.resource.id;
export const getResourceConfiguration = (state: ResourceState) => state.data;
export const getResourceType = (state: ResourceState) => state.type;

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

export const getGroups = (state: ResourceState) => {
  const regex = RegExp(state.groupSearchQuery, 'i');

  return state.groups.filter((group) => {
    return regex.test(group.group_name);
  });
};
