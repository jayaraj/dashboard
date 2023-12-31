import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { CsvEntry, CsvEntriesState, CsvEntryState, CsvError, CsvErrorsState } from 'app/types';

export const initialBulksState: CsvEntriesState = {
  csvEntries: [],
  csvEntriesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const bulksSlice = createSlice({
  name: 'bulks',
  initialState: initialBulksState,
  reducers: {
    bulksLoaded: (state, action: PayloadAction<CsvEntry[]>): CsvEntriesState => {
      return { ...state, hasFetched: true, csvEntries: action.payload };
    },
    setBulksSearchQuery: (state, action: PayloadAction<string>): CsvEntriesState => {
      return { ...state, searchQuery: action.payload };
    },
    setBulksSearchPage: (state, action: PayloadAction<number>): CsvEntriesState => {
      return { ...state, searchPage: action.payload };
    },
    setBulksCount: (state, action: PayloadAction<number>): CsvEntriesState => {
      return { ...state, csvEntriesCount: action.payload };
    },
  },
});
export const { bulksLoaded, setBulksSearchQuery, setBulksSearchPage, setBulksCount } =
bulksSlice.actions;
export const bulksReducer = bulksSlice.reducer;

export const initialBulkState: CsvEntryState = {
  csvEntry: {} as CsvEntry,
};
const bulkSlice = createSlice({
  name: 'bulk',
  initialState: initialBulkState,
  reducers: {
    bulkLoaded: (state, action: PayloadAction<CsvEntry>): CsvEntryState => {
      return { ...state, csvEntry: action.payload };
    },
  },
});
export const { bulkLoaded } = bulkSlice.actions;
export const bulkReducer = bulkSlice.reducer;

export const initialBulkErrorsState: CsvErrorsState = {
  csvErrors: [],
  csvErrorsCount: 0,
  searchPage: 1,
  hasFetched: false,
};
const bulkErrorsSlice = createSlice({
  name: 'bulkErrors',
  initialState: initialBulkErrorsState,
  reducers: {
    bulkErrorsLoaded: (state, action: PayloadAction<CsvError[]>): CsvErrorsState => {
      return { ...state, hasFetched: true, csvErrors: action.payload };
    },
    setBulkErrorsSearchPage: (state, action: PayloadAction<number>): CsvErrorsState => {
      return { ...state, searchPage: action.payload };
    },
    setBulkErrorsCount: (state, action: PayloadAction<number>): CsvErrorsState => {
      return { ...state, csvErrorsCount: action.payload };
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
