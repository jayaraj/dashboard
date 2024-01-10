import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GroupConfigurationState, GroupConfiguration } from 'app/types/devicemanagement/configuration';
import {
  GroupResource,
  Group,
  GroupsState,
  GroupState,
  GroupUser,
  GroupResourcesState,
  GroupUsersState,
} from 'app/types/devicemanagement/group';

export const initialGroupsState: GroupsState = {
  groups: [],
  searchPage: 1,
  groupsCount: 0,
  searchQuery: '',
  hasFetched: false,
};
const groupsSlice = createSlice({
  name: 'groups',
  initialState: initialGroupsState,
  reducers: {
    setHasGroupsFetched: (state, action: PayloadAction<boolean>): GroupsState => {
      return { ...state, hasFetched: action.payload };
    },
    groupsLoaded: (state, action: PayloadAction<Group[]>): GroupsState => {
      return { ...state, hasFetched: true, groups: action.payload };
    },
    setGroupsSearchQuery: (state, action: PayloadAction<string>): GroupsState => {
      return { ...state, searchQuery: action.payload };
    },
    setGroupsSearchPage: (state, action: PayloadAction<number>): GroupsState => {
      return { ...state, searchPage: action.payload };
    },
    setGroupsCount: (state, action: PayloadAction<number>): GroupsState => {
      return { ...state, groupsCount: action.payload };
    },
  },
});
export const { setHasGroupsFetched, groupsLoaded, setGroupsSearchQuery, setGroupsSearchPage, setGroupsCount } =
  groupsSlice.actions;
export const groupsReducer = groupsSlice.reducer;

export const initialGroupState: GroupState = {
  group: {} as Group,
};
const groupSlice = createSlice({
  name: 'group',
  initialState: initialGroupState,
  reducers: {
    groupLoaded: (state, action: PayloadAction<Group>): GroupState => {
      return { ...state, group: action.payload };
    },
  },
});
export const { groupLoaded } = groupSlice.actions;
export const groupReducer = groupSlice.reducer;

export const initialGroupResourcesState: GroupResourcesState = {
  groupResources: [],
  searchPage: 1,
  groupResourcesCount: 0,
  searchQuery: '',
  hasFetched: false,
};
const groupResourcesSlice = createSlice({
  name: 'groupResources',
  initialState: initialGroupResourcesState,
  reducers: {
    setHasGroupResourcesFetched: (state, action: PayloadAction<boolean>): GroupResourcesState => {
      return { ...state, hasFetched: action.payload };
    },
    groupResourcesLoaded: (state, action: PayloadAction<GroupResource[]>): GroupResourcesState => {
      return { ...state, hasFetched: true, groupResources: action.payload };
    },
    setGroupResourcesSearchQuery: (state, action: PayloadAction<string>): GroupResourcesState => {
      return { ...state, searchQuery: action.payload };
    },
    setGroupResourcesSearchPage: (state, action: PayloadAction<number>): GroupResourcesState => {
      return { ...state, searchPage: action.payload };
    },
    setGroupResourcesCount: (state, action: PayloadAction<number>): GroupResourcesState => {
      return { ...state, groupResourcesCount: action.payload };
    },
  },
});
export const {
  groupResourcesLoaded,
  setGroupResourcesSearchQuery,
  setGroupResourcesSearchPage,
  setGroupResourcesCount,
  setHasGroupResourcesFetched,
} = groupResourcesSlice.actions;
export const groupResourcesReducer = groupResourcesSlice.reducer;

export const initialGroupUsersState: GroupUsersState = {
  groupUsers: [],
  searchPage: 1,
  groupUsersCount: 0,
  searchQuery: '',
  hasFetched: false,
};
const groupUsersSlice = createSlice({
  name: 'groupUsers',
  initialState: initialGroupUsersState,
  reducers: {
    setHasGroupUsersFetched: (state, action: PayloadAction<boolean>): GroupUsersState => {
      return { ...state, hasFetched: action.payload };
    },
    groupUsersLoaded: (state, action: PayloadAction<GroupUser[]>): GroupUsersState => {
      return { ...state, hasFetched: true, groupUsers: action.payload };
    },
    setGroupUsersSearchQuery: (state, action: PayloadAction<string>): GroupUsersState => {
      return { ...state, searchQuery: action.payload };
    },
    setGroupUsersSearchPage: (state, action: PayloadAction<number>): GroupUsersState => {
      return { ...state, searchPage: action.payload };
    },
    setGroupUsersCount: (state, action: PayloadAction<number>): GroupUsersState => {
      return { ...state, groupUsersCount: action.payload };
    },
  },
});
export const { groupUsersLoaded, setHasGroupUsersFetched, setGroupUsersSearchQuery, setGroupUsersSearchPage, setGroupUsersCount } =
  groupUsersSlice.actions;
export const groupUsersReducer = groupUsersSlice.reducer;

export const initialGroupConfigurationState: GroupConfigurationState = {
  configuration: {} as GroupConfiguration,
};
const groupConfigurationSlice = createSlice({
  name: 'groupConfiguration',
  initialState: initialGroupConfigurationState,
  reducers: {
    groupConfigurationLoaded: (state, action: PayloadAction<GroupConfiguration>): GroupConfigurationState => {
      return { ...state, configuration: action.payload };
    },
  },
});
export const { groupConfigurationLoaded } = groupConfigurationSlice.actions;
export const groupConfigurationReducer = groupConfigurationSlice.reducer;

export default {
  groups: groupsReducer,
  group: groupReducer,
  groupResources: groupResourcesReducer,
  groupUsers: groupUsersReducer,
  groupConfiguration: groupConfigurationReducer,
};
