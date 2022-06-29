import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import { resourceTypeLoaded, resourceTypesLoaded, setResourceTypeSearchPage, setResourceTypeCount } from './reducers';

export function loadResourceTypes(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/resourcetypes/search', {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(resourceTypesLoaded(response.resource_types));
    dispatch(setResourceTypeSearchPage(response.page));
    dispatch(setResourceTypeCount(response.count));
  };
}

export function loadResourceType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/resourcetypes/${id}`);
    dispatch(resourceTypeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateResourceType(type: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const resourceType = getStore().resourceType.resourceType;
    await getBackendSrv().put(`/api/resourcetypes/${resourceType.id}`, {
      id: resourceType.id,
      type,
    });
    dispatch(loadResourceType(resourceType.id));
  };
}

export function deleteResourceType(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/resourcetypes/${id}`);
    dispatch(loadResourceTypes('', 1, perPage));
  };
}
