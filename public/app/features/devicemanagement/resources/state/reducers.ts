import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ResourceGroup, Resource, ResourcesState, ResourceState, ResourceGroupsState, ResourceConfigurationState, ResourceConfiguration } from 'app/types';

export const initialResourcesState: ResourcesState = {
  resources: [],
  searchPage: 1,
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
    setResourcesSearchQuery: (state, action: PayloadAction<string>): ResourcesState => {
      return { ...state, searchQuery: action.payload };
    },
    setResourcesSearchPage: (state, action: PayloadAction<number>): ResourcesState => {
      return { ...state, searchPage: action.payload };
    },
    setResourcesCount: (state, action: PayloadAction<number>): ResourcesState => {
      return { ...state, resourcesCount: action.payload };
    },
  },
});
export const { resourcesLoaded, setResourcesSearchQuery, setResourcesSearchPage, setResourcesCount } = resourcesSlice.actions;
export const resourcesReducer = resourcesSlice.reducer;

export const initialResourceState: ResourceState = {
  resource: {} as Resource,
};
const resourceSlice = createSlice({
  name: 'resource',
  initialState: initialResourceState,
  reducers: {
    resourceLoaded: (state, action: PayloadAction<Resource>): ResourceState => {
      return { ...state, resource: action.payload };
    },
  },
});
export const { resourceLoaded } = resourceSlice.actions;
export const resourceReducer = resourceSlice.reducer;

export const initialResourceGroupsState: ResourceGroupsState = {
  resourceGroups: [],
  searchPage: 1,
  resourceGroupsCount: 0,
  searchQuery: '',
  hasFetched: false,
};
const resourceGroupsSlice = createSlice({
  name: 'resourceGroups',
  initialState: initialResourceGroupsState,
  reducers: {
    resourceGroupsLoaded: (state, action: PayloadAction<ResourceGroup[]>): ResourceGroupsState => {
      return { ...state, hasFetched: true, resourceGroups: action.payload };
    },
    setResourceGroupsSearchQuery: (state, action: PayloadAction<string>): ResourceGroupsState => {
      return { ...state, searchQuery: action.payload };
    },
    setResourceGroupsSearchPage: (state, action: PayloadAction<number>): ResourceGroupsState => {
      return { ...state, searchPage: action.payload };
    },
    setResourceGroupsCount: (state, action: PayloadAction<number>): ResourceGroupsState => {
      return { ...state, resourceGroupsCount: action.payload };
    },
  },
});
export const { resourceGroupsLoaded, setResourceGroupsSearchQuery, setResourceGroupsSearchPage, setResourceGroupsCount } = resourceGroupsSlice.actions;
export const resourceGroupsReducer = resourceGroupsSlice.reducer;

export const initialResourceConfigurationState: ResourceConfigurationState = {
  configuration: {} as ResourceConfiguration,
};
const resourceConfigurationSlice = createSlice({
  name: 'resourceConfiguration',
  initialState: initialResourceConfigurationState,
  reducers: {
    resourceConfigurationLoaded: (state, action: PayloadAction<ResourceConfiguration>): ResourceConfigurationState => {
      return { ...state, configuration: action.payload };
    },
  },
});
export const { resourceConfigurationLoaded } = resourceConfigurationSlice.actions;
export const resourceConfigurationReducer = resourceConfigurationSlice.reducer;

export default {
  resources: resourcesReducer,
  resource: resourceReducer,
  resourceGroups: resourceGroupsReducer,
  resourceConfiguration: resourceConfigurationReducer,
};
