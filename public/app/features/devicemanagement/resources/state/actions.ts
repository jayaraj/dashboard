import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';
import { UpdateResourceDTO, resourcesPageLimit, resourceGroupsPageLimit } from 'app/types/devicemanagement/resource';

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
  setResourcesSearchQuery,
  setResourceGroupsSearchQuery,
} from './reducers';

export function loadResources(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().resources;
    const response = await getBackendSrv().get('/api/resources/search', {
      query: searchQuery,
      page: searchPage,
      perPage: resourcesPageLimit,
    });
    dispatch(resourcesLoaded(response.resources));
    dispatch(setResourcesCount(response.count));
  };
}
const loadResourcesWithDebounce = debounce((dispatch) => dispatch(loadResources()), 500);

export function changeResourcesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setResourcesSearchQuery(query));
    loadResourcesWithDebounce(dispatch);
  };
}

export function changeResourcesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setResourcesSearchPage(page));
    dispatch(loadResources());
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
      tags: dto.tags,
    });
    dispatch(loadResource(resource.id));
  };
}

export function deleteResource(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/resources/${id}`);
    dispatch(loadResources());
  };
}

export function loadResourceGroups(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resource = getStore().resource.resource;
    const { searchPage, searchQuery } = getStore().resourceGroups;
    const response = await getBackendSrv().get(`/api/resources/${resource.id}/groups`, {
      query: searchQuery,
      page: searchPage,
      perPage: resourceGroupsPageLimit,
    });
    dispatch(resourceGroupsLoaded(response.resource_groups));
    dispatch(setResourceGroupsCount(response.count));
  };
}

const loadResourceGroupsWithDebounce = debounce((dispatch) => dispatch(loadResourceGroups()), 500);

export function changeResourceGroupsQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setResourceGroupsSearchQuery(query));
    loadResourceGroupsWithDebounce(dispatch);
  };
}

export function changeResourceGroupsPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setResourceGroupsSearchPage(page));
    dispatch(loadResourceGroups());
  };
}

export function deleteResourceGroup(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groupresources/${id}`);
    dispatch(loadResourceGroups());
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
