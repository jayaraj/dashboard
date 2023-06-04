import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult, UpdateResourceDTO, resourceGroupPageLimit, resourcePageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import {
  resourceLoaded,
  resourcesLoaded,
  resourceConfigurationLoaded,
  setResourceGroupsSearchPage,
  setResourceGroupsCount,
  resourceGroupsLoaded,
  setResourcesSearchPage,
  setResourcesCount,
} from './reducers';

export function loadResources(query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/resources/search', { query: query, page: page, perPage: resourcePageLimit });
    dispatch(resourcesLoaded(response.resources));
    dispatch(setResourcesSearchPage(response.page));
    dispatch(setResourcesCount(response.count));
  };
}

export function loadResource(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/resources/${id}`);
    dispatch(resourceLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateResource(dto: UpdateResourceDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    await getBackendSrv().put(`/api/resources/${resource.id}`, {
      name: dto.name,
      uuid: dto.uuid,
      image_url: dto.image_url,
      longitude: Number(dto.longitude),
      latitude: Number(dto.latitude),
    });
    dispatch(loadResource(resource.id));
  };
}

export function deleteResource(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/resources/${id}`);
    dispatch(loadResources('', 1));
  };
}

export function loadResourceGroups(query: string, page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    const response = await getBackendSrv().get(`/api/resources/${resource.id}/groups`, {
      query: query,
      page: page,
      perPage: resourceGroupPageLimit,
    });
    dispatch(resourceGroupsLoaded(response.resource_groups));
    dispatch(setResourceGroupsSearchPage(response.page));
    dispatch(setResourceGroupsCount(response.count));
  };
}

export function deleteResourceGroup(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groupresources/${id}`);
    dispatch(loadResourceGroups('', 1));
  };
}

export function loadResourceConfiguration(type: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    const response = await getBackendSrv().get(`/api/resources/${resource.id}/configurations/${type}`);
    dispatch(resourceConfigurationLoaded(response));
  };
}

export function updateResourceConfiguration(type: string, configuration: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    await getBackendSrv().put(`/api/resources/${resource.id}/configurations/${type}`, {
      configuration: configuration,
    });
    dispatch(loadResourceConfiguration(type));
  };
}

export function deleteGroupConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configuration = getStore().resourceConfiguration.configuration;
    const resource = getStore().resource.resource;
    await getBackendSrv().delete(`/api/resourceconfigurations/${configuration.id}`);
    dispatch(loadResourceConfiguration(resource.type));
  };
}