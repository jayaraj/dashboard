import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { Group, ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import {
  resourceLoaded,
  groupsLoaded,
  resourcesLoaded,
  setResourcePage,
  setResourceCount,
  setGroupPage,
  setGroupCount,
  resourceTypeConfigurationLoaded,
  resourceConfigurationLoaded,
} from './reducers';

export function loadResources(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/resources/search', { query: query, page: page, perPage: perPage });
    dispatch(resourcesLoaded(response.resources));
    dispatch(setResourcePage(response.page));
    dispatch(setResourceCount(response.count));
  };
}

export function loadResource(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/resources/${id}`);
    dispatch(resourceLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
    dispatch(loadResourceConfiguration());
    dispatch(loadResourceTypeConfiguration());
  };
}

export function updateResource(name: string, uuid: string, longitude: number, latitude: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    await getBackendSrv().put(`/api/resources/${resource.id}`, {
      name,
      uuid,
      longitude,
      latitude,
    });
    dispatch(loadResource(resource.id));
  };
}

export function deleteResource(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/resources/${id}`);
    dispatch(loadResources('', 1, perPage));
  };
}

export function cloneResource(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().post(`/api/resources/${id}/clone`);
    dispatch(loadResources('', 1, perPage));
  };
}

export function loadGroups(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    const response = await getBackendSrv().get(`/api/resources/${resource.id}/groups`, {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(groupsLoaded(response.resource_groups));
    dispatch(setGroupPage(response.page));
    dispatch(setGroupCount(response.count));
  };
}

export function addGroup(group: Group, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    await getBackendSrv().post(`/api/resources/${resource.id}/groups`, { group_id: group.id });
    dispatch(loadGroups('', 1, perPage));
  };
}

export function deleteGroup(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    await getBackendSrv().delete(`/api/resources/${resource.id}/groups/${id}`);
    dispatch(loadGroups('', 1, perPage));
  };
}

export function loadResourceConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    const response = await getBackendSrv().get(`/api/resources/${resource.id}/configurations/${resource.type}`);
    dispatch(resourceConfigurationLoaded(response));
  };
}

export function updateResourceConfiguration(data: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    await getBackendSrv().put(`/api/resources/${resource.id}/configurations/${resource.type}`, {
      configuration: data,
    });
    dispatch(loadResourceConfiguration());
  };
}

export function loadResourceTypeConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    const response = await getBackendSrv().get(`/api/resourcetypes/type/${resource.type}`);
    dispatch(resourceTypeConfigurationLoaded(response));
  };
}
