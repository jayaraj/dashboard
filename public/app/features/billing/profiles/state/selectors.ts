import { Profile, ProfilesState, ProfileState, Slab, SlabState } from 'app/types';

export const getSearchQuery = (state: ProfilesState) => state.searchQuery;
export const getProfileSearchPage = (state: ProfilesState) => state.searchPage;
export const getProfilesCount = (state: ProfilesState) => state.profilesCount;


export const getSlab = (state: SlabState, currentProfileId: any): Slab | null => {
  if (state.slab.profile_id === parseInt(currentProfileId, 10)) {
    return state.slab;
  }
  return null;
};

export const getProfile = (state: ProfileState, currentProfileId: any): Profile | null => {
  if (state.profile.id === parseInt(currentProfileId, 10)) {
    return state.profile;
  }
  return null;
};

export const getProfiles = (state: ProfilesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.profiles.filter((profile) => {
    return regex.test(profile.name);
  });
};
