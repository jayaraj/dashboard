import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ResourceConfiguration, ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import { orgTypeLoaded, orgTypesLoaded, setOrgTypeSearchPage, setOrgTypeCount, orgTypeConfigurationLoaded } from './reducers';

export function loadOrgTypes(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/orgtypes/search', {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(orgTypesLoaded(response.org_types));
    dispatch(setOrgTypeSearchPage(response.page));
    dispatch(setOrgTypeCount(response.count));
  };
}

export function loadOrgType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/orgtypes/${id}`);
    dispatch(orgTypeLoaded(response));
    dispatch(loadOrgConfiguration(response.type));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateOrgType(type: string, configuration: ResourceConfiguration): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const orgType = getStore().orgType.orgType;
    await getBackendSrv().put(`/api/orgtypes/${orgType.id}`, {
      id: orgType.id,
      type,
      configuration,
    });
    dispatch(loadOrgType(orgType.id));
  };
}

export function deleteOrgType(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/orgtypes/${id}`);
    dispatch(loadOrgTypes('', 1, perPage));
  };
}

export function loadOrgConfiguration(type: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/orgs/configurations/${type}`);
    dispatch(orgTypeConfigurationLoaded(response));
  };
}

export function updateOrgConfiguration(data: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const orgType = getStore().orgType.orgType;
    await getBackendSrv().put(`/api/orgs/configurations/${orgType.type}`, {
      configuration: data,
    });
    dispatch(loadOrgConfiguration(orgType.type));
  };
}
