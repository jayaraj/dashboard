import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GroupResource, Group, GroupsState, GroupState, GroupUser } from 'app/types';

export const initialGroupsState: GroupsState = { groups: [], page: 1, count: 0, searchQuery: '', hasFetched: false };

const groupsSlice = createSlice({
  name: 'groups',
  initialState: initialGroupsState,
  reducers: {
    groupsLoaded: (state, action: PayloadAction<Group[]>): GroupsState => {
      return { ...state, hasFetched: true, groups: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): GroupsState => {
      return { ...state, searchQuery: action.payload };
    },
    setGroupPage: (state, action: PayloadAction<number>): GroupsState => {
      return { ...state, page: action.payload };
    },
    setGroupCount: (state, action: PayloadAction<number>): GroupsState => {
      return { ...state, count: action.payload };
    },
  },
});

export const { groupsLoaded, setSearchQuery, setGroupPage, setGroupCount } = groupsSlice.actions;

export const groupsReducer = groupsSlice.reducer;

export const initialGroupState: GroupState = {
  group: {} as Group,
  searchChildrenQuery: '',
  resources: [] as GroupResource[],
  resourceSearchQuery: '',
  resourcesCount: 0,
  resourcesPage: 1,
  users: [] as GroupUser[],
  userSearchQuery: '',
  usersCount: 0,
  usersPage: 1,
  hasFetched: true,
};

const groupSlice = createSlice({
  name: 'group',
  initialState: initialGroupState,
  reducers: {
    groupLoaded: (state, action: PayloadAction<Group>): GroupState => {
      return { ...state, group: action.payload };
    },
    setChildrenSearchQuery: (state, action: PayloadAction<string>): GroupState => {
      return { ...state, searchChildrenQuery: action.payload };
    },
    resourcesLoaded: (state, action: PayloadAction<GroupResource[]>): GroupState => {
      return { ...state, resources: action.payload };
    },
    setResourceSearchQuery: (state, action: PayloadAction<string>): GroupState => {
      return { ...state, resourceSearchQuery: action.payload };
    },
    setResourcePage: (state, action: PayloadAction<number>): GroupState => {
      return { ...state, resourcesPage: action.payload };
    },
    setResourceCount: (state, action: PayloadAction<number>): GroupState => {
      return { ...state, resourcesCount: action.payload };
    },
    usersLoaded: (state, action: PayloadAction<GroupUser[]>): GroupState => {
      return { ...state, users: action.payload };
    },
    setUserSearchQuery: (state, action: PayloadAction<string>): GroupState => {
      return { ...state, userSearchQuery: action.payload };
    },
    setUserPage: (state, action: PayloadAction<number>): GroupState => {
      return { ...state, usersPage: action.payload };
    },
    setUserCount: (state, action: PayloadAction<number>): GroupState => {
      return { ...state, usersCount: action.payload };
    },
  },
});

export const {
  groupLoaded,
  resourcesLoaded,
  setResourcePage,
  setChildrenSearchQuery,
  setResourceCount,
  setResourceSearchQuery,
  usersLoaded,
  setUserSearchQuery,
  setUserPage,
  setUserCount,
} = groupSlice.actions;

export const groupReducer = groupSlice.reducer;

export default {
  groups: groupsReducer,
  group: groupReducer,
};
