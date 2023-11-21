import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult, UpdateProfileDTO, profilePageLimit, slabPageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import { profileLoaded, profilesLoaded, setProfileSearchPage, setProfileCount, slabLoaded, slabsLoaded, setSlabsSearchPage, setSlabsCount } from './reducers';

export function loadProfiles(query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/orgs/profiles', {
      query: query,
      page: page,
      perPage: profilePageLimit,
    });
    dispatch(profilesLoaded(response.profiles));
    dispatch(setProfileSearchPage(response.page));
    dispatch(setProfileCount(response.count));
  };
}

export function loadProfile(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/profiles/${id}`);
    dispatch(profileLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateProfile(dto: UpdateProfileDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const profile = getStore().profile.profile;
    await getBackendSrv().put(`/api/profiles/${profile.id}`, {
      id: profile.id,
      name: dto.name,
      description: dto.description,
    });
    dispatch(loadProfile(profile.id));
  };
}

export function deleteProfile(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/profiles/${id}`);
    dispatch(loadProfiles('', 1));
  };
}

export function loadSlabs(id: number, query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/profiles/${id}/slabs`, {
      query: query,
      page: page,
      perPage: slabPageLimit,
    });
    dispatch(slabsLoaded(response.slabs));
    dispatch(setSlabsSearchPage(response.page));
    dispatch(setSlabsCount(response.count));
  };
}

export function loadSlab(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/slabs/${id}`);
    dispatch(slabLoaded(response));
  };
}

export function deleteSlab(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const profile = getStore().profile.profile;
    await getBackendSrv().delete(`/api/slabs/${id}`);
    dispatch(loadSlabs(profile.id, '', 1));
  };
}

