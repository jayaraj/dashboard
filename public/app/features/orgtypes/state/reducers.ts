import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { OrgType, OrgTypesState, OrgTypeState } from 'app/types';

export const initialOrgTypesState: OrgTypesState = {
  orgTypes: [],
  orgTypesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};

const orgTypesSlice = createSlice({
  name: 'orgTypes',
  initialState: initialOrgTypesState,
  reducers: {
    orgTypesLoaded: (state, action: PayloadAction<OrgType[]>): OrgTypesState => {
      return { ...state, hasFetched: true, orgTypes: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): OrgTypesState => {
      return { ...state, searchQuery: action.payload };
    },
    setOrgTypeSearchPage: (state, action: PayloadAction<number>): OrgTypesState => {
      return { ...state, searchPage: action.payload };
    },
    setOrgTypeCount: (state, action: PayloadAction<number>): OrgTypesState => {
      return { ...state, orgTypesCount: action.payload };
    },
  },
});

export const { orgTypesLoaded, setSearchQuery, setOrgTypeSearchPage, setOrgTypeCount } =
  orgTypesSlice.actions;

export const orgTypesReducer = orgTypesSlice.reducer;

export const initialOrgTypeState: OrgTypeState = {
  orgType: {} as OrgType,
  data: {},
};

const orgTypeSlice = createSlice({
  name: 'orgType',
  initialState: initialOrgTypeState,
  reducers: {
    orgTypeLoaded: (state, action: PayloadAction<OrgType>): OrgTypeState => {
      return { ...state, orgType: action.payload };
    },
    orgTypeConfigurationLoaded: (state, action: PayloadAction<any>): OrgTypeState => {
      return { ...state, data: action.payload };
    },
  },
});

export const { orgTypeLoaded, orgTypeConfigurationLoaded } = orgTypeSlice.actions;
export const orgTypeReducer = orgTypeSlice.reducer;

export default {
  orgTypes: orgTypesReducer,
  orgType: orgTypeReducer,
};
