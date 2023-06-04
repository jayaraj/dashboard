import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult, UpdateGroupDTO, groupPageLimit, groupUserPageLimit, resourcePageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import { groupConfigurationLoaded, groupLoaded, groupResourcesLoaded, groupUsersLoaded, groupsLoaded, setGroupResourcesCount, setGroupResourcesSearchPage, setGroupUsersCount, setGroupUsersSearchPage, setGroupsCount, setGroupsSearchPage, setHasFetched } from './reducers';

export function loadGroups(parent: number, query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setHasFetched(false));
    const response = await getBackendSrv().get('/api/groups', {
      parent: parent,
      query: query,
      page: page,
      perPage: groupPageLimit,
    });
    dispatch(groupsLoaded(response.groups));
    dispatch(setGroupsSearchPage(response.page));
    dispatch(setGroupsCount(response.count));
  };
}

export function loadGroup(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/groups/${id}`);
    dispatch(groupLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateGroup(dto: UpdateGroupDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().put(`/api/groups/${group.id}`, {
      name: dto.name,
    });
    dispatch(loadGroup(group.id));
  };
}

export function deleteGroup(parent: number, id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groups/${id}`);
    dispatch(loadGroups(parent, '', 1));
  };
}

export function loadGroupResources(query: string, page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/resources`, {
      query: query,
      page: page,
      perPage: resourcePageLimit,
    });
    dispatch(groupResourcesLoaded(response.group_resources));
    dispatch(setGroupResourcesSearchPage(response.page));
    dispatch(setGroupResourcesCount(response.count));
  };
}

export function deleteGroupResource(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groupresources/${id}`);
    dispatch(loadGroupResources('', 1));
  };
}

export function loadGroupUsers(query: string, page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/users`, {
      query: query,
      page: page,
      perPage: groupUserPageLimit,
    });
    dispatch(groupUsersLoaded(response.group_users));
    dispatch(setGroupUsersSearchPage(response.page));
    dispatch(setGroupUsersCount(response.count));
  };
}

export function addGroupUser(userId: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().post(`/api/groupusers`, { group_id: group.id,  group_path: group.path, user_id: userId });
    dispatch(loadGroupUsers('', 1));
  };
}

export function deleteGroupUser(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groupusers/${id}`);
    dispatch(loadGroupUsers('', 1));
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

export function deleteGroupConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configuration = getStore().groupConfiguration.configuration;
    const group = getStore().group.group;
    await getBackendSrv().delete(`/api/groupconfigurations/${configuration.id}`);
    dispatch(loadGroupConfiguration(group.type));
  };
}