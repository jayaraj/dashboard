import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import {CreateSlabDTO, ThunkResult, UpdateProfileDTO, UpdateSlabDTO, profilePageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import { profileLoaded, profilesLoaded, setProfileSearchPage, setProfileCount, slabLoaded } from './reducers';

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

export function loadSlab(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/profiles/${id}/slab`);
    dispatch(slabLoaded(response));
  };
}

export function createSlab(dto: CreateSlabDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const profile = getStore().profile.profile;
    await getBackendSrv().post(`/api/slabs`, {
      tax: dto.tax,
      slabs: dto.rates?.length,
      rates: dto.rates,
      profile_id: profile.id,
    });
    dispatch(loadSlab(profile.id));
  };
}

export function updateSlab(dto: UpdateSlabDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const profile = getStore().profile.profile;
    await getBackendSrv().put(`/api/slabs/${dto.id}`, {
      tax: dto.tax,
      slabs: dto.rates?.length,
      rates: dto.rates,
    });
    dispatch(loadSlab(profile.id));
  };
}

export function deleteSlab(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const profile = getStore().profile.profile;
    await getBackendSrv().delete(`/api/slabs/${id}`);
    dispatch(loadSlab(profile.id));
  };
}

