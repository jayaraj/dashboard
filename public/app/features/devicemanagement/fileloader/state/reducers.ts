import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import {
  CsvEntriesState,
  CsvEntry,
  CsvEntryState,
  CsvError,
  CsvErrorsState,
} from 'app/types/devicemanagement/fileloader';

export const initialCsvEntriesState: CsvEntriesState = {
  csvEntries: [],
  csvEntriesCount: 0,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const csvEntriesSlice = createSlice({
  name: 'csvEntries',
  initialState: initialCsvEntriesState,
  reducers: {
    csvEntriesLoaded: (state, action: PayloadAction<CsvEntry[]>): CsvEntriesState => {
      return { ...state, hasFetched: true, csvEntries: action.payload };
    },
    setCsvEntriesSearchQuery: (state, action: PayloadAction<string>): CsvEntriesState => {
      return { ...state, searchQuery: action.payload };
    },
    setCsvEntriesSearchPage: (state, action: PayloadAction<number>): CsvEntriesState => {
      return { ...state, searchPage: action.payload };
    },
    setCsvEntriesCount: (state, action: PayloadAction<number>): CsvEntriesState => {
      return { ...state, csvEntriesCount: action.payload };
    },
  },
});
export const { csvEntriesLoaded, setCsvEntriesSearchQuery, setCsvEntriesSearchPage, setCsvEntriesCount } =
  csvEntriesSlice.actions;
export const csvEntriesReducer = csvEntriesSlice.reducer;

export const initialCsvEntryState: CsvEntryState = {
  csvEntry: {} as CsvEntry,
};
const csvEntrySlice = createSlice({
  name: 'csvEntry',
  initialState: initialCsvEntryState,
  reducers: {
    csvEntryLoaded: (state, action: PayloadAction<CsvEntry>): CsvEntryState => {
      return { ...state, csvEntry: action.payload };
    },
  },
});
export const { csvEntryLoaded } = csvEntrySlice.actions;
export const csvEntryReducer = csvEntrySlice.reducer;

export const initialCsvErrorsState: CsvErrorsState = {
  csvErrors: [],
  csvErrorsCount: 0,
  searchPage: 1,
  hasFetched: false,
};
const csvErrorsSlice = createSlice({
  name: 'csvErrors',
  initialState: initialCsvErrorsState,
  reducers: {
    csvErrorsLoaded: (state, action: PayloadAction<CsvError[]>): CsvErrorsState => {
      return { ...state, hasFetched: true, csvErrors: action.payload };
    },
    setCsvErrorsSearchPage: (state, action: PayloadAction<number>): CsvErrorsState => {
      return { ...state, searchPage: action.payload };
    },
    setCsvErrorsCount: (state, action: PayloadAction<number>): CsvErrorsState => {
      return { ...state, csvErrorsCount: action.payload };
    },
  },
});
export const { csvErrorsLoaded, setCsvErrorsSearchPage, setCsvErrorsCount } = csvErrorsSlice.actions;
export const csvErrorsReducer = csvErrorsSlice.reducer;

export default {
  csvEntries: csvEntriesReducer,
  CsvEntry: csvEntryReducer,
  csvErrors: csvErrorsReducer,
};
