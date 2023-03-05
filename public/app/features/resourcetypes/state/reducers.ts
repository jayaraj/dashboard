import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ResourceType, ResourceTypesState, ResourceTypeState, Slab, SlabState } from 'app/types';

export const initialResourceTypesState: ResourceTypesState = {
  resourceTypes: [],
  resourceTypesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};

const resourceTypesSlice = createSlice({
  name: 'resourceTypes',
  initialState: initialResourceTypesState,
  reducers: {
    resourceTypesLoaded: (state, action: PayloadAction<ResourceType[]>): ResourceTypesState => {
      return { ...state, hasFetched: true, resourceTypes: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): ResourceTypesState => {
      return { ...state, searchQuery: action.payload };
    },
    setResourceTypeSearchPage: (state, action: PayloadAction<number>): ResourceTypesState => {
      return { ...state, searchPage: action.payload };
    },
    setResourceTypeCount: (state, action: PayloadAction<number>): ResourceTypesState => {
      return { ...state, resourceTypesCount: action.payload };
    },
  },
});

export const { resourceTypesLoaded, setSearchQuery, setResourceTypeSearchPage, setResourceTypeCount } =
  resourceTypesSlice.actions;

export const resourceTypesReducer = resourceTypesSlice.reducer;

export const initialResourceTypeState: ResourceTypeState = {
  resourceType: {} as ResourceType,
};

const resourceTypeSlice = createSlice({
  name: 'resourceType',
  initialState: initialResourceTypeState,
  reducers: {
    resourceTypeLoaded: (state, action: PayloadAction<ResourceType>): ResourceTypeState => {
      return { ...state, resourceType: action.payload };
    },
  },
});

export const { resourceTypeLoaded } = resourceTypeSlice.actions;

export const resourceTypeReducer = resourceTypeSlice.reducer;


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
  resourceTypes: resourceTypesReducer,
  resourceType: resourceTypeReducer,
  slab: slabReducer,
};
