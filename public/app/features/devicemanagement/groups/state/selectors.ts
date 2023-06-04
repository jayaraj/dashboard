import { Group, GroupConfigurationState, GroupResourcesState, GroupsState, GroupState, GroupUsersState } from 'app/types';

export const getGroupsSearchQuery = (state: GroupsState) => state.searchQuery;
export const getGroupsSearchPage = (state: GroupsState) => state.searchPage;
export const getGroupsCount = (state: GroupsState) => state.groupsCount;
export const getGroupResourcesSearchQuery = (state: GroupResourcesState) => state.searchQuery;
export const getGroupResourcesSearchPage = (state: GroupResourcesState) => state.searchPage;
export const getGroupResourcesCount = (state: GroupResourcesState) => state.groupResourcesCount;
export const getGroupUsersSearchQuery = (state: GroupUsersState) => state.searchQuery;
export const getGroupUsersSearchPage = (state: GroupUsersState) => state.searchPage;
export const getGroupUsersCount = (state: GroupUsersState) => state.groupUsersCount;
export const getGroupConfiguration = (state: GroupConfigurationState) => state.configuration;

export const getGroup = (state: GroupState, currentGroupId: any): Group | null => {
  if (state.group.id === parseInt(currentGroupId, 10)) {
    return state.group;
  }
  return null;
};

export const getGroups = (state: GroupsState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.groups.filter((group) => {
    return regex.test(group.name);
  });
};

export const getGroupResources = (state: GroupResourcesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.groupResources.filter((resource) => {
    return regex.test(resource.resource_name);
  });
};

export const getGroupUsers = (state: GroupUsersState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.groupUsers.filter((user) => {
    return regex.test(user.name);
  });
};
