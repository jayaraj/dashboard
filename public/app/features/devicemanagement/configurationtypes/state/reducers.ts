import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { ConfigurationType, ConfigurationTypesState, ConfigurationTypeState } from 'app/types';

export const initialConfigurationTypesState: ConfigurationTypesState = {
  configurationTypes: [],
  configurationTypesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const configurationTypesSlice = createSlice({
  name: 'configurationTypes',
  initialState: initialConfigurationTypesState,
  reducers: {
    configurationTypesLoaded: (state, action: PayloadAction<ConfigurationType[]>): ConfigurationTypesState => {
      return { ...state, hasFetched: true, configurationTypes: action.payload };
    },
    setConfigurationTypesSearchQuery: (state, action: PayloadAction<string>): ConfigurationTypesState => {
      return { ...state, searchQuery: action.payload };
    },
    setConfigurationTypesSearchPage: (state, action: PayloadAction<number>): ConfigurationTypesState => {
      return { ...state, searchPage: action.payload };
    },
    setConfigurationTypesCount: (state, action: PayloadAction<number>): ConfigurationTypesState => {
      return { ...state, configurationTypesCount: action.payload };
    },
  },
});
export const { configurationTypesLoaded, setConfigurationTypesSearchQuery, setConfigurationTypesSearchPage, setConfigurationTypesCount } =
  configurationTypesSlice.actions;
export const configurationTypesReducer = configurationTypesSlice.reducer;

export const initialConfigurationTypeState: ConfigurationTypeState = {
  configurationType: {} as ConfigurationType,
};
const configurationTypeSlice = createSlice({
  name: 'configurationType',
  initialState: initialConfigurationTypeState,
  reducers: {
    configurationTypeLoaded: (state, action: PayloadAction<ConfigurationType>): ConfigurationTypeState => {
      return { ...state, configurationType: action.payload };
    },
  },
});
export const { configurationTypeLoaded } = configurationTypeSlice.actions;
export const configurationTypeReducer = configurationTypeSlice.reducer;

export default {
  configurationTypes: configurationTypesReducer,
  configurationType: configurationTypeReducer,
};
