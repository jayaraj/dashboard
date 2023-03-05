import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { GroupResource, Group, GroupsState, GroupState, GroupUser, InvoicesState, Invoice, InvoiceState, Transaction, TransactionsState, QueryRange } from 'app/types';

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

export const initialInvoicesState: InvoicesState = {
  invoices: [] as Invoice[],
  range: {from: '', to: ''} as QueryRange,
  page: 1,
  count: 0,
  hasFetched: false,
};

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState: initialInvoicesState,
  reducers: {
    invoicesLoaded: (state, action: PayloadAction<Invoice[]>): InvoicesState => {
      return { ...state, hasFetched: true, invoices: action.payload };
    },
    setInvoicesRange: (state, action: PayloadAction<QueryRange>): InvoicesState => {
      return { ...state, range: action.payload };
    },
    setInvoicesPage: (state, action: PayloadAction<number>): InvoicesState => {
      return { ...state, page: action.payload };
    },
    setInvoicesCount: (state, action: PayloadAction<number>): InvoicesState => {
      return { ...state, count: action.payload };
    },
  },
});

export const { invoicesLoaded, setInvoicesRange, setInvoicesPage, setInvoicesCount } = invoicesSlice.actions;
export const invoicesReducer = invoicesSlice.reducer;

export const initialInvoiceState: InvoiceState = {
  invoice: {} as Invoice,
};

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState: initialInvoiceState,
  reducers: {
    invoiceLoaded: (state, action: PayloadAction<Invoice>): InvoiceState => {
      return { ...state, invoice: action.payload };
    },
  },
});

export const { invoiceLoaded } = invoiceSlice.actions;
export const invoiceReducer = invoiceSlice.reducer;

export const initialTransactionsState: TransactionsState = {
  transactions: [] as Transaction[],
  range: {from: '', to: ''} as QueryRange,
  page: 1,
  count: 0,
  hasFetched: false,
};

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: initialTransactionsState,
  reducers: {
    transactionsLoaded: (state, action: PayloadAction<Transaction[]>): TransactionsState => {
      return { ...state, hasFetched: true, transactions: action.payload };
    },
    setTransactionsRange: (state, action: PayloadAction<QueryRange>): TransactionsState => {
      return { ...state, range: action.payload };
    },
    setTransactionsPage: (state, action: PayloadAction<number>): TransactionsState => {
      return { ...state, page: action.payload };
    },
    setTransactionsCount: (state, action: PayloadAction<number>): TransactionsState => {
      return { ...state, count: action.payload };
    },
  },
});

export const { transactionsLoaded, setTransactionsRange, setTransactionsPage, setTransactionsCount } = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;

export default {
  groups: groupsReducer,
  group: groupReducer,
  invoices: invoicesReducer,
  invoice: invoiceReducer,
  transactions: transactionsReducer,
};
