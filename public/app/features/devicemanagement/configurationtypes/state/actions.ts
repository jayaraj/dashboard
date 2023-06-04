import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import {ThunkResult, UpdateConfigurationTypeDTO, configurationTypePageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import { configurationTypeLoaded, configurationTypesLoaded, setConfigurationTypesSearchPage, setConfigurationTypesCount } from './reducers';
import { orgConfigurationsLoaded } from 'app/features/billing/connections/state/reducers';

export function loadConfigurationTypes(query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/configurationtypes/search', {
      query: query,
      page: page,
      perPage: configurationTypePageLimit,
    });
    dispatch(configurationTypesLoaded(response.configuration_types));
    dispatch(setConfigurationTypesSearchPage(response.page));
    dispatch(setConfigurationTypesCount(response.count));
  };
}

export function loadConfigurationType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/${id}`);
    dispatch(configurationTypeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateConfigurationType(dto: UpdateConfigurationTypeDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configurationType = getStore().configurationType.configurationType;
    await getBackendSrv().put(`/api/configurationtypes/${configurationType.id}`, {
      id: configurationType.id,
      type: dto.type,
      associated_with: dto.associated_with,
      measurement: dto.measurement,
      role: dto.role,
      configuration: dto.configuration,
    });
    dispatch(loadConfigurationType(configurationType.id));
  };
}

export function deleteConfigurationType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/configurationtypes/${id}`);
    dispatch(loadConfigurationTypes('', 1));
  };
}

export function loadConfigurationTypeByAssociationAndType(association: string, type: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/configurationtypes/association/${association}/type/${type}`);
    dispatch(configurationTypeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function loadOrgConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configurationType = getStore().configurationType.configurationType;
    if (configurationType.associated_with === 'org') {
      const response = await getBackendSrv().get(`/api/orgs/configurations/${configurationType.type}`);
      dispatch(orgConfigurationsLoaded(response));
    }
  };
}

export function updateOrgConfiguration(configuration: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configurationType = getStore().configurationType.configurationType;
    await getBackendSrv().put(`/api/orgs/configurations/${configurationType.type}`, {
      configuration: configuration,
    });
    dispatch(loadOrgConfiguration());
  };
}

export function deleteGroupConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configuration = getStore().orgConfiguration.configuration;
    await getBackendSrv().delete(`/api/orgconfigurations/${configuration.id}`);
    dispatch(loadOrgConfiguration());
  };
}