import { Group, GroupsState, GroupState } from 'app/types';

export const getSearchQuery = (state: GroupsState) => state.searchQuery;
export const getGroupsPage = (state: GroupsState) => state.page;
export const getGroupsCount = (state: GroupsState) => state.count;
export const getResourceSearchQuery = (state: GroupState) => state.resourceSearchQuery;
export const getResourcesCount = (state: GroupState) => state.resourcesCount;
export const getResourcesPage = (state: GroupState) => state.resourcesPage;
export const getUserSearchQuery = (state: GroupState) => state.userSearchQuery;
export const getUsersCount = (state: GroupState) => state.usersCount;
export const getUsersPage = (state: GroupState) => state.usersPage;
export const getGroupId = (state: GroupState) => state.group.id;
export const getChildrenSearchQuery = (state: GroupState) => state.searchChildrenQuery;

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

export const getResources = (state: GroupState) => {
  const regex = RegExp(state.resourceSearchQuery, 'i');

  return state.resources.filter((resource) => {
    return regex.test(resource.resource_name);
  });
};

export const getUsers = (state: GroupState) => {
  const regex = RegExp(state.userSearchQuery, 'i');

  return state.users.filter((user) => {
    return regex.test(user.name);
  });
};

export const getChildren = (state: GroupState, currentGroupId: any): Group[] => {
  const regex = RegExp(state.searchChildrenQuery, 'i');

  if (state.group.id === parseInt(currentGroupId, 10) && state.group.groups) {
    return state.group.groups.filter((group) => {
      return regex.test(group.name);
    });
  } else {
    return [];
  }
};
