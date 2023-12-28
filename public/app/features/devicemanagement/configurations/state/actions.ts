import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';
import { UpdateConfigurationTypeDTO, configurationTypesPageLimit } from 'app/types/devicemanagement/configuration';

import { buildNavModel } from './navModel';
import {
  configurationTypeLoaded,
  configurationTypesLoaded,
  setConfigurationTypesSearchPage,
  setConfigurationTypesCount,
  orgConfigurationsLoaded,
  setConfigurationTypesSearchQuery,
} from './reducers';

export function loadConfigurationTypes(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().configurationTypes;
    const response = await getBackendSrv().get('/api/configurationtypes/search', {
      query: searchQuery,
      page: searchPage,
      perPage: configurationTypesPageLimit,
    });
    dispatch(configurationTypesLoaded(response.configuration_types));
    dispatch(setConfigurationTypesCount(response.count));
  };
}

const loadConfigurationTypesWithDebounce = debounce((dispatch) => dispatch(loadConfigurationTypes()), 500);
export function changeConfigurationTypesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConfigurationTypesSearchQuery(query));
    loadConfigurationTypesWithDebounce(dispatch);
  };
}

export function changeConfigurationTypesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConfigurationTypesSearchPage(page));
    dispatch(loadConfigurationTypes());
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
    dispatch(loadConfigurationTypes());
  };
}

export function loadOrgConfiguration(config: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/orgs/configurations/${config}`);
    dispatch(orgConfigurationsLoaded(response));
  };
}

export function updateOrgConfiguration(config: string, configuration: any): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().put(`/api/orgs/configurations/${config}`, {
      configuration: configuration,
    });
    dispatch(loadOrgConfiguration(config));
  };
}
