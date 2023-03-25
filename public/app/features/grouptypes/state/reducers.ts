import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GroupType, GroupTypesState, GroupTypeState } from 'app/types';

export const initialGroupTypesState: GroupTypesState = {
  groupTypes: [],
  groupTypesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};

const groupTypesSlice = createSlice({
  name: 'groupTypes',
  initialState: initialGroupTypesState,
  reducers: {
    groupTypesLoaded: (state, action: PayloadAction<GroupType[]>): GroupTypesState => {
      return { ...state, hasFetched: true, groupTypes: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): GroupTypesState => {
      return { ...state, searchQuery: action.payload };
    },
    setGroupTypeSearchPage: (state, action: PayloadAction<number>): GroupTypesState => {
      return { ...state, searchPage: action.payload };
    },
    setGroupTypeCount: (state, action: PayloadAction<number>): GroupTypesState => {
      return { ...state, groupTypesCount: action.payload };
    },
  },
});

export const { groupTypesLoaded, setSearchQuery, setGroupTypeSearchPage, setGroupTypeCount } =
  groupTypesSlice.actions;

export const groupTypesReducer = groupTypesSlice.reducer;

export const initialGroupTypeState: GroupTypeState = {
  groupType: {} as GroupType,
};

const groupTypeSlice = createSlice({
  name: 'groupType',
  initialState: initialGroupTypeState,
  reducers: {
    groupTypeLoaded: (state, action: PayloadAction<GroupType>): GroupTypeState => {
      return { ...state, groupType: action.payload };
    },
  },
});

export const { groupTypeLoaded } = groupTypeSlice.actions;
export const groupTypeReducer = groupTypeSlice.reducer;

export default {
  groupTypes: groupTypesReducer,
  groupType: groupTypeReducer,
};
