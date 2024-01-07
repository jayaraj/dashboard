import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';
import { UpdateProfileDTO, profilesPageLimit, slabsPageLimit } from 'app/types/billing/profile';

import { buildNavModel } from './navModel';
import {
  profileLoaded,
  profilesLoaded,
  setProfilesSearchPage,
  setProfilesCount,
  slabLoaded,
  slabsLoaded,
  setSlabsSearchPage,
  setSlabsCount,
  setSlabsSearchQuery,
  setProfilesSearchQuery,
} from './reducers';

export function loadProfiles(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().profiles;
    const response = await getBackendSrv().get('/api/profiles', {
      query: searchQuery,
      page: searchPage,
      perPage: profilesPageLimit,
    });
    dispatch(profilesLoaded(response.profiles));
    dispatch(setProfilesCount(response.count));
  };
}

const loadProfilesWithDebounce = debounce((dispatch) => dispatch(loadProfiles()), 500);
export function changeProfilesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setProfilesSearchQuery(query));
    loadProfilesWithDebounce(dispatch);
  };
}

export function changeProfilesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setProfilesSearchPage(page));
    dispatch(loadProfiles());
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
    dispatch(loadProfiles());
  };
}

export function loadSlabs(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const profile = getStore().profile.profile;
    const { searchPage, searchQuery } = getStore().slabs;
    const response = await getBackendSrv().get(`/api/profiles/${profile.id}/slabs`, {
      query: searchQuery,
      page: searchPage,
      perPage: slabsPageLimit,
    });
    dispatch(slabsLoaded(response.slabs));
    dispatch(setSlabsCount(response.count));
  };
}

const loadSlabsWithDebounce = debounce((dispatch) => dispatch(loadSlabs()), 500);

export function changeSlabsQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setSlabsSearchQuery(query));
    loadSlabsWithDebounce(dispatch);
  };
}

export function changeSlabsPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setSlabsSearchPage(page));
    dispatch(loadSlabs());
  };
}

export function loadSlab(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/slabs/${id}`);
    dispatch(slabLoaded(response));
  };
}

export function deleteSlab(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/slabs/${id}`);
    dispatch(loadSlabs());
  };
}
