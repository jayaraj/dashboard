import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Connection, ConnectionLog, ConnectionLogsState, ConnectionsState, ConnectionState, ConnectionUser, ConnectionUsersState, Invoice, InvoicesState, InvoiceState, OrgConfiguration, OrgConfigurationState, QueryRange, Transaction, TransactionsState } from 'app/types';

export const initialConnectionsState: ConnectionsState = {
  connections: [],
  connectionsCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const connectionsSlice = createSlice({
  name: 'connections',
  initialState: initialConnectionsState,
  reducers: {
    connectionsLoaded: (state, action: PayloadAction<Connection[]>): ConnectionsState => {
      return { ...state, hasFetched: true, connections: action.payload };
    },
    setConnectionsSearchQuery: (state, action: PayloadAction<string>): ConnectionsState => {
      return { ...state, searchQuery: action.payload };
    },
    setConnectionsSearchPage: (state, action: PayloadAction<number>): ConnectionsState => {
      return { ...state, searchPage: action.payload };
    },
    setConnectionsCount: (state, action: PayloadAction<number>): ConnectionsState => {
      return { ...state, connectionsCount: action.payload };
    },
  },
});
export const { connectionsLoaded, setConnectionsSearchQuery, setConnectionsSearchPage, setConnectionsCount } =
  connectionsSlice.actions;
export const connectionsReducer = connectionsSlice.reducer;

export const initialConnectionState: ConnectionState = {
  connection: {} as Connection,
};
const connectionSlice = createSlice({
  name: 'connection',
  initialState: initialConnectionState,
  reducers: {
    connectionLoaded: (state, action: PayloadAction<Connection>): ConnectionState => {
      return { ...state, connection: action.payload };
    },
  },
});
export const { connectionLoaded } = connectionSlice.actions;
export const connectionReducer = connectionSlice.reducer;

export const initialConnectionLogsState: ConnectionLogsState = {
  connectionLogs: [],
  connectionLogsCount: 0,
  searchPage: 1,
  hasFetched: false,
};
const connectionLogsSlice = createSlice({
  name: 'connectionLogs',
  initialState: initialConnectionLogsState,
  reducers: {
    connectionLogsLoaded: (state, action: PayloadAction<ConnectionLog[]>): ConnectionLogsState => {
      return { ...state, hasFetched: true, connectionLogs: action.payload };
    },
    setConnectionLogsSearchPage: (state, action: PayloadAction<number>): ConnectionLogsState => {
      return { ...state, searchPage: action.payload };
    },
    setConnectionLogsCount: (state, action: PayloadAction<number>): ConnectionLogsState => {
      return { ...state, connectionLogsCount: action.payload };
    },
  },
});
export const { connectionLogsLoaded, setConnectionLogsSearchPage, setConnectionLogsCount } =
  connectionLogsSlice.actions;
export const connectionLogsReducer = connectionLogsSlice.reducer;

export const initialConnectionUsersState: ConnectionUsersState = {
  connectionUsers: [],
  connectionUsersCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const connectionUsersSlice = createSlice({
  name: 'connectionUsers',
  initialState: initialConnectionUsersState,
  reducers: {
    connectionUsersLoaded: (state, action: PayloadAction<ConnectionUser[]>): ConnectionUsersState => {
      return { ...state, hasFetched: true, connectionUsers: action.payload };
    },
    setConnectionUsersSearchPage: (state, action: PayloadAction<number>): ConnectionUsersState => {
      return { ...state, searchPage: action.payload };
    },
    setConnectionUsersCount: (state, action: PayloadAction<number>): ConnectionUsersState => {
      return { ...state, connectionUsersCount: action.payload };
    },
  },
});
export const { connectionUsersLoaded, setConnectionUsersSearchPage, setConnectionUsersCount } =
  connectionUsersSlice.actions;
export const connectionUsersReducer = connectionUsersSlice.reducer;

export const initialInvoicesState: InvoicesState = {
  invoices: [],
  invoicesCount: 0,
  searchPage: 1,
  hasFetched: false,
  searchRange: {from: '', to: ''} as QueryRange,
};
const invoicesSlice = createSlice({
  name: 'invoice',
  initialState: initialInvoicesState,
  reducers: {
    invoicesLoaded: (state, action: PayloadAction<Invoice[]>): InvoicesState => {
      return { ...state, hasFetched: true, invoices: action.payload };
    },
    setInvoicesSearchPage: (state, action: PayloadAction<number>): InvoicesState => {
      return { ...state, searchPage: action.payload };
    },
    setInvoicesCount: (state, action: PayloadAction<number>): InvoicesState => {
      return { ...state, invoicesCount: action.payload };
    },
    setInvoicesSearchRange: (state, action: PayloadAction<QueryRange>): InvoicesState => {
      return { ...state, searchRange: action.payload };
    },
  },
});
export const { invoicesLoaded, setInvoicesSearchPage, setInvoicesSearchRange, setInvoicesCount } =
  invoicesSlice.actions;
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
  searchRange: {from: '', to: ''} as QueryRange,
  searchPage: 1,
  transactionsCount: 0,
  hasFetched: false,
};
const transactionsSlice = createSlice({
  name: 'transactions',
  initialState: initialTransactionsState,
  reducers: {
    transactionsLoaded: (state, action: PayloadAction<Transaction[]>): TransactionsState => {
      return { ...state, hasFetched: true, transactions: action.payload };
    },
    setTransactionsSearchRange: (state, action: PayloadAction<QueryRange>): TransactionsState => {
      return { ...state, searchRange: action.payload };
    },
    setTransactionsSearchPage: (state, action: PayloadAction<number>): TransactionsState => {
      return { ...state, searchPage: action.payload };
    },
    setTransactionsCount: (state, action: PayloadAction<number>): TransactionsState => {
      return { ...state, transactionsCount: action.payload };
    },
  },
});
export const { transactionsLoaded, setTransactionsSearchRange, setTransactionsSearchPage, setTransactionsCount } = transactionsSlice.actions;
export const transactionsReducer = transactionsSlice.reducer;

export const initialOrgConfigurationState: OrgConfigurationState = {
  configuration: {} as any,
};
const orgConfigurationSlice = createSlice({
  name: 'orgConfiguration',
  initialState: initialOrgConfigurationState,
  reducers: {
    orgConfigurationsLoaded: (state, action: PayloadAction<OrgConfiguration>): OrgConfigurationState => {
      return { ...state, configuration: action.payload };
    },
  },
});
export const { orgConfigurationsLoaded } = orgConfigurationSlice.actions;
export const orgConfigurationReducer = orgConfigurationSlice.reducer;

export default {
  connections: connectionsReducer,
  connection: connectionReducer,
  connectionLogs: connectionLogsReducer,
  connectionUsers: connectionUsersReducer,
  invoices: invoicesReducer,
  invoice: invoiceReducer,
  transactions: transactionsReducer,
  orgConfiguration: orgConfigurationReducer,
};
