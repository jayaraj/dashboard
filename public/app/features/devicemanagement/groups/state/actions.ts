import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';
import {
  UpdateGroupDTO,
  groupsPageLimit,
  groupUsersPageLimit,
  groupResourcesPageLimit,
} from 'app/types/devicemanagement/group';

import { buildNavModel } from './navModel';
import {
  groupConfigurationLoaded,
  groupLoaded,
  groupResourcesLoaded,
  groupUsersLoaded,
  groupsLoaded,
  setGroupResourcesCount,
  setGroupResourcesSearchPage,
  setGroupResourcesSearchQuery,
  setGroupUsersCount,
  setGroupUsersSearchPage,
  setGroupUsersSearchQuery,
  setGroupsCount,
  setGroupsSearchPage,
  setGroupsSearchQuery,
} from './reducers';

export function loadGroups(parent: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().groups;
    const response = await getBackendSrv().get('/api/groups', {
      parent: parent,
      query: searchQuery,
      page: searchPage,
      perPage: groupsPageLimit,
    });
    dispatch(groupsLoaded(response.groups));
    dispatch(setGroupsCount(response.count));
  };
}

const loadGroupsWithDebounce = debounce((dispatch, parent) => dispatch(loadGroups(parent)), 500);

export function changeGroupsQuery(query: string, parent: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setGroupsSearchQuery(query));
    loadGroupsWithDebounce(dispatch, parent);
  };
}

export function changeGroupsPage(page: number, parent: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setGroupsSearchPage(page));
    dispatch(loadGroups(parent));
  };
}

export function loadGroup(id: number): ThunkResult<void> {
  return async (dispatch) => {
    let response = await getBackendSrv().get(`/api/groups/${id}`);
    const groupPathName = await getBackendSrv().get(`/api/groups/${id}/pathname`);
    response = { ...response, pathname: groupPathName.pathname };
    dispatch(groupLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateGroup(dto: UpdateGroupDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().put(`/api/groups/${group.id}`, {
      name: dto.name,
      tags: dto.tags,
    });
    dispatch(loadGroup(group.id));
  };
}

export function deleteGroup(id: number, parent: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groups/${id}`);
    dispatch(loadGroups(parent));
  };
}

export function loadGroupResources(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const { searchPage, searchQuery } = getStore().groupResources;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/resources`, {
      query: searchQuery,
      page: searchPage,
      perPage: groupResourcesPageLimit,
    });
    dispatch(groupResourcesLoaded(response.group_resources));
    dispatch(setGroupResourcesCount(response.count));
  };
}

const loadGroupResourcesWithDebounce = debounce((dispatch) => dispatch(loadGroupResources()), 500);

export function changeGroupResourcesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setGroupResourcesSearchQuery(query));
    loadGroupResourcesWithDebounce(dispatch);
  };
}

export function changeGroupResourcesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setGroupResourcesSearchPage(page));
    dispatch(loadGroupResources());
  };
}

export function deleteGroupResource(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groupresources/${id}`);
    dispatch(loadGroupResources());
  };
}

export function loadGroupUsers(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const { searchPage, searchQuery } = getStore().groupUsers;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/users`, {
      query: searchQuery,
      page: searchPage,
      perPage: groupUsersPageLimit,
    });
    dispatch(groupUsersLoaded(response.group_users));
    dispatch(setGroupUsersCount(response.count));
  };
}

const loadGroupUsersWithDebounce = debounce((dispatch) => dispatch(loadGroupUsers()), 500);

export function changeGroupUsersQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setGroupUsersSearchQuery(query));
    loadGroupUsersWithDebounce(dispatch);
  };
}

export function changeGroupUsersPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setGroupUsersSearchPage(page));
    dispatch(loadGroupResources());
  };
}

export function addGroupUser(userId: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().post(`/api/groupusers`, { group_id: group.id, group_path: group.path, user_id: userId });
    dispatch(loadGroupUsers());
  };
}

export function deleteGroupUser(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groupusers/${id}`);
    dispatch(loadGroupUsers());
  };
}

export function loadGroupConfiguration(type: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/configurations/${type}`);
    dispatch(groupConfigurationLoaded(response));
  };
}

export function updateGroupConfiguration(type: string, configuration: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().put(`/api/groups/${group.id}/configurations/${type}`, {
      configuration: configuration,
    });
    dispatch(loadGroupConfiguration(type));
  };
}
