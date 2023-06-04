import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Bulk, BulksState, BulkState, BulkError, BulkErrorsState } from 'app/types';

export const initialBulksState: BulksState = {
  bulks: [],
  bulksCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const bulksSlice = createSlice({
  name: 'bulks',
  initialState: initialBulksState,
  reducers: {
    bulksLoaded: (state, action: PayloadAction<Bulk[]>): BulksState => {
      return { ...state, hasFetched: true, bulks: action.payload };
    },
    setBulksSearchQuery: (state, action: PayloadAction<string>): BulksState => {
      return { ...state, searchQuery: action.payload };
    },
    setBulksSearchPage: (state, action: PayloadAction<number>): BulksState => {
      return { ...state, searchPage: action.payload };
    },
    setBulksCount: (state, action: PayloadAction<number>): BulksState => {
      return { ...state, bulksCount: action.payload };
    },
  },
});
export const { bulksLoaded, setBulksSearchQuery, setBulksSearchPage, setBulksCount } =
bulksSlice.actions;
export const bulksReducer = bulksSlice.reducer;

export const initialBulkState: BulkState = {
  bulk: {} as Bulk,
};
const bulkSlice = createSlice({
  name: 'bulk',
  initialState: initialBulkState,
  reducers: {
    bulkLoaded: (state, action: PayloadAction<Bulk>): BulkState => {
      return { ...state, bulk: action.payload };
    },
  },
});
export const { bulkLoaded } = bulkSlice.actions;
export const bulkReducer = bulkSlice.reducer;

export const initialBulkErrorsState: BulkErrorsState = {
  bulkErrors: [],
  bulkErrorsCount: 0,
  searchPage: 1,
  hasFetched: false,
};
const bulkErrorsSlice = createSlice({
  name: 'bulkErrors',
  initialState: initialBulkErrorsState,
  reducers: {
    bulkErrorsLoaded: (state, action: PayloadAction<BulkError[]>): BulkErrorsState => {
      return { ...state, hasFetched: true, bulkErrors: action.payload };
    },
    setBulkErrorsSearchPage: (state, action: PayloadAction<number>): BulkErrorsState => {
      return { ...state, searchPage: action.payload };
    },
    setBulkErrorsCount: (state, action: PayloadAction<number>): BulkErrorsState => {
      return { ...state, bulkErrorsCount: action.payload };
    },
  },
});
export const { bulkErrorsLoaded, setBulkErrorsSearchPage, setBulkErrorsCount } = bulkErrorsSlice.actions;
export const bulkErrorsReducer = bulkErrorsSlice.reducer;

export default {
  bulks: bulksReducer,
  bulk: bulkReducer,
  bulkErrors: bulkErrorsReducer,
};
