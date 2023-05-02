import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Bulk, BulksState, BulkState, BulkError } from 'app/types';

export const initialBulksState: BulksState = {
  bulks: [],
  bulksCount: 0,
  page: 1,
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
      return { ...state, page: action.payload };
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
  bulkErrors: [],
  bulkErrorsCount: 0,
  page: 1,
  hasFetched: false,
};

const bulkSlice = createSlice({
  name: 'bulk',
  initialState: initialBulkState,
  reducers: {
    bulkLoaded: (state, action: PayloadAction<Bulk>): BulkState => {
      return { ...state, bulk: action.payload };
    },
    bulkErrorsLoaded: (state, action: PayloadAction<BulkError[]>): BulkState => {
      return { ...state, hasFetched: true, bulkErrors: action.payload };
    },
    setBulkErrorsSearchPage: (state, action: PayloadAction<number>): BulkState => {
      return { ...state, page: action.payload };
    },
    setBulkErrorsCount: (state, action: PayloadAction<number>): BulkState => {
      return { ...state, bulkErrorsCount: action.payload };
    },
  },
});

export const { bulkLoaded, bulkErrorsLoaded, setBulkErrorsSearchPage, setBulkErrorsCount } = bulkSlice.actions;
export const bulkReducer = bulkSlice.reducer;

export default {
  bulks: bulksReducer,
  bulk: bulkReducer,
};
