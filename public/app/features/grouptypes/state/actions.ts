import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ResourceConfiguration, ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import { groupTypeLoaded, groupTypesLoaded, setGroupTypeSearchPage, setGroupTypeCount } from './reducers';

export function loadGroupTypes(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/grouptypes/search', {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(groupTypesLoaded(response.group_types));
    dispatch(setGroupTypeSearchPage(response.page));
    dispatch(setGroupTypeCount(response.count));
  };
}

export function loadGroupType(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/grouptypes/${id}`);
    dispatch(groupTypeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateGroupType(type: string, configuration: ResourceConfiguration): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const groupType = getStore().groupType.groupType;
    await getBackendSrv().put(`/api/grouptypes/${groupType.id}`, {
      id: groupType.id,
      type,
      configuration,
    });
    dispatch(loadGroupType(groupType.id));
  };
}

export function deleteGroupType(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/grouptypes/${id}`);
    dispatch(loadGroupTypes('', 1, perPage));
  };
}


