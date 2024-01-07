import { Profile, ProfilesState, ProfileState, Slab, SlabsState, SlabState } from 'app/types/billing/profile';

export const getProfilesSearchQuery = (state: ProfilesState) => state.searchQuery;
export const getProfilesSearchPage = (state: ProfilesState) => state.searchPage;
export const getProfilesCount = (state: ProfilesState) => state.profilesCount;
export const getSlabsSearchQuery = (state: SlabsState) => state.searchQuery;
export const getSlabsSearchPage = (state: SlabsState) => state.searchPage;
export const getSlabsCount = (state: SlabsState) => state.slabsCount;
export const getSlabs = (state: SlabsState) => state.slabs;
export const getProfiles = (state: ProfilesState) => state.profiles;

export const getSlab = (state: SlabState, currentId: any): Slab | null => {
  if (state.slab.id === parseInt(currentId, 10)) {
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
