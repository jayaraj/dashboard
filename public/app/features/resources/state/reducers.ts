import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ResourceGroup, Resource, ResourcesState, ResourceState, ResourceType } from 'app/types';

export const initialResourcesState: ResourcesState = {
  resources: [],
  page: 1,
  resourcesCount: 0,
  searchQuery: '',
  hasFetched: false,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState: initialResourcesState,
  reducers: {
    resourcesLoaded: (state, action: PayloadAction<Resource[]>): ResourcesState => {
      return { ...state, hasFetched: true, resources: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): ResourcesState => {
      return { ...state, searchQuery: action.payload };
    },
    setResourcePage: (state, action: PayloadAction<number>): ResourcesState => {
      return { ...state, page: action.payload };
    },
    setResourceCount: (state, action: PayloadAction<number>): ResourcesState => {
      return { ...state, resourcesCount: action.payload };
    },
  },
});

export const { resourcesLoaded, setSearchQuery, setResourcePage, setResourceCount } = resourcesSlice.actions;

export const resourcesReducer = resourcesSlice.reducer;

export const initialResourceState: ResourceState = {
  resource: {} as Resource,
  groups: [] as ResourceGroup[],
  groupSearchQuery: '',
  groupsCount: 0,
  groupsPage: 1,
  hasFetched: true,
  data: {},
  type: {} as ResourceType,
};

const resourceSlice = createSlice({
  name: 'resource',
  initialState: initialResourceState,
  reducers: {
    resourceLoaded: (state, action: PayloadAction<Resource>): ResourceState => {
      return { ...state, resource: action.payload };
    },
    groupsLoaded: (state, action: PayloadAction<ResourceGroup[]>): ResourceState => {
      return { ...state, groups: action.payload };
    },
    setGroupSearchQuery: (state, action: PayloadAction<string>): ResourceState => {
      return { ...state, groupSearchQuery: action.payload };
    },
    setGroupPage: (state, action: PayloadAction<number>): ResourceState => {
      return { ...state, groupsPage: action.payload };
    },
    setGroupCount: (state, action: PayloadAction<number>): ResourceState => {
      return { ...state, groupsCount: action.payload };
    },
    resourceConfigurationLoaded: (state, action: PayloadAction<any>): ResourceState => {
      return { ...state, data: action.payload };
    },
    resourceTypeConfigurationLoaded: (state, action: PayloadAction<ResourceType>): ResourceState => {
      return { ...state, type: action.payload };
    },
  },
});

export const { resourceLoaded, groupsLoaded, setGroupPage, setGroupCount, setGroupSearchQuery, resourceConfigurationLoaded,
  resourceTypeConfigurationLoaded, } = resourceSlice.actions;

export const resourceReducer = resourceSlice.reducer;

export default {
  resources: resourcesReducer,
  resource: resourceReducer,
};
