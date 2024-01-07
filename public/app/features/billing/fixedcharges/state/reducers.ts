import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FixedCharge, FixedChargesState, FixedChargeState } from 'app/types/billing/fixedcharge';

export const initialFixedChargesState: FixedChargesState = {
  fixedCharges: [],
  searchPage: 1,
  fixedChargesCount: 0,
  searchQuery: '',
  hasFetched: false,
};

const fixedChargesSlice = createSlice({
  name: 'fixedCharges',
  initialState: initialFixedChargesState,
  reducers: {
    setHasFetched: (state, action: PayloadAction<boolean>): FixedChargesState => {
      return { ...state, hasFetched: action.payload };
    },
    fixedChargesLoaded: (state, action: PayloadAction<FixedCharge[]>): FixedChargesState => {
      return { ...state, hasFetched: true, fixedCharges: action.payload };
    },
    setFixedChargesSearchQuery: (state, action: PayloadAction<string>): FixedChargesState => {
      return { ...state, searchPage: 1, searchQuery: action.payload };
    },
    setFixedChargesSearchPage: (state, action: PayloadAction<number>): FixedChargesState => {
      return { ...state, searchPage: action.payload };
    },
    setFixedChargesCount: (state, action: PayloadAction<number>): FixedChargesState => {
      return { ...state, fixedChargesCount: action.payload };
    },
  },
});

export const {
  setHasFetched,
  fixedChargesLoaded,
  setFixedChargesSearchQuery,
  setFixedChargesSearchPage,
  setFixedChargesCount,
} = fixedChargesSlice.actions;
export const fixedChargesReducer = fixedChargesSlice.reducer;

export const initialFixedChargeState: FixedChargeState = {
  fixedCharge: {} as FixedCharge,
};

const fixedChargeSlice = createSlice({
  name: 'fixedCharge',
  initialState: initialFixedChargeState,
  reducers: {
    fixedChargeLoaded: (state, action: PayloadAction<FixedCharge>): FixedChargeState => {
      return { ...state, fixedCharge: action.payload };
    },
  },
});

export const { fixedChargeLoaded } = fixedChargeSlice.actions;
export const fixedChargeReducer = fixedChargeSlice.reducer;

export default {
  fixedCharges: fixedChargesReducer,
  fixedCharge: fixedChargeReducer,
};
