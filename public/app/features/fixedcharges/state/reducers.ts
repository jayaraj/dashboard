import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { FixedCharge, FixedChargesState, FixedChargeState } from 'app/types';

export const initialFixedChargesState: FixedChargesState = {
  fixedCharges: [],
  hasFetched: false,
};

const fixedChargesSlice = createSlice({
  name: 'fixedCharges',
  initialState: initialFixedChargesState,
  reducers: {
    fixedChargesLoaded: (state, action: PayloadAction<FixedCharge[]>): FixedChargesState => {
      return { ...state, hasFetched: true, fixedCharges: action.payload };
    },
  },
});

export const { fixedChargesLoaded } = fixedChargesSlice.actions;

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
