import { GroupConfigurationState } from 'app/types/devicemanagement/configuration';
import { Group, GroupResourcesState, GroupsState, GroupState, GroupUsersState } from 'app/types/devicemanagement/group';

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
export const getGroups = (state: GroupsState) => state.groups;
export const getGroupResources = (state: GroupResourcesState) => state.groupResources;
export const getGroupUsers = (state: GroupUsersState) => state.groupUsers;

export const getGroup = (state: GroupState, currentGroupId: any): Group | null => {
  if (state.group.id === parseInt(currentGroupId, 10)) {
    return state.group;
  }
  return null;
};
