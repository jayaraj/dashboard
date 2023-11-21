import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Profile, ProfilesState, ProfileState, Slab, SlabsState, SlabState } from 'app/types';

export const initialProfilesState: ProfilesState = {
  profiles: [],
  profilesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};

const profilesSlice = createSlice({
  name: 'profiles',
  initialState: initialProfilesState,
  reducers: {
    profilesLoaded: (state, action: PayloadAction<Profile[]>): ProfilesState => {
      return { ...state, hasFetched: true, profiles: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): ProfilesState => {
      return { ...state, searchQuery: action.payload };
    },
    setProfileSearchPage: (state, action: PayloadAction<number>): ProfilesState => {
      return { ...state, searchPage: action.payload };
    },
    setProfileCount: (state, action: PayloadAction<number>): ProfilesState => {
      return { ...state, profilesCount: action.payload };
    },
  },
});

export const { profilesLoaded, setSearchQuery, setProfileSearchPage, setProfileCount } =
  profilesSlice.actions;

export const profilesReducer = profilesSlice.reducer;

export const initialProfileState: ProfileState = {
  profile: {} as Profile,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState: initialProfileState,
  reducers: {
    profileLoaded: (state, action: PayloadAction<Profile>): ProfileState => {
      return { ...state, profile: action.payload };
    },
  },
});

export const { profileLoaded } = profileSlice.actions;
export const profileReducer = profileSlice.reducer;

export const initialSlabsState: SlabsState = {
  slabs: [],
  slabsCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const slabsSlice = createSlice({
  name: 'slabs',
  initialState: initialSlabsState,
  reducers: {
    slabsLoaded: (state, action: PayloadAction<Slab[]>): SlabsState => {
      return { ...state, hasFetched: true, slabs: action.payload };
    },
    setSlabsSearchPage: (state, action: PayloadAction<number>): SlabsState => {
      return { ...state, searchPage: action.payload };
    },
    setSlabsSearchQuery: (state, action: PayloadAction<string>): SlabsState => {
      return { ...state, searchQuery: action.payload };
    },
    setSlabsCount: (state, action: PayloadAction<number>): SlabsState => {
      return { ...state, slabsCount: action.payload };
    },
  },
});
export const { slabsLoaded, setSlabsSearchPage, setSlabsSearchQuery, setSlabsCount } =
  slabsSlice.actions;
export const slabsReducer = slabsSlice.reducer;

export const initialSlabState: SlabState = {
  slab: {} as Slab,
};
const slabSlice = createSlice({
  name: 'slab',
  initialState: initialSlabState,
  reducers: {
    slabLoaded: (state, action: PayloadAction<Slab>): SlabState => {
      return { ...state, slab: action.payload };
    },
  },
});
export const { slabLoaded } = slabSlice.actions;
export const slabReducer = slabSlice.reducer;

export default {
  profiles: profilesReducer,
  profile: profileReducer,
  slab: slabReducer,
  slabs: slabsReducer,
};
