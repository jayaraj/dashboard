import { ResourceType, ResourceTypesState, ResourceTypeState } from 'app/types';

export const getSearchQuery = (state: ResourceTypesState) => state.searchQuery;
export const getResourceTypeSearchPage = (state: ResourceTypesState) => state.searchPage;
export const getResourceTypesCount = (state: ResourceTypesState) => state.resourceTypesCount;

export const getResourceType = (state: ResourceTypeState, currentResourceTypeId: any): ResourceType | null => {
  if (state.resourceType.id === parseInt(currentResourceTypeId, 10)) {
    return state.resourceType;
  }
  return null;
};

export const getResourceTypes = (state: ResourceTypesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.resourceTypes.filter((resourceType) => {
    return regex.test(resourceType.type);
  });
};
