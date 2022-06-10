import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { DashboardNav, DashboardNavsState } from 'app/types';

export const initialDashboardNavsState: DashboardNavsState = { dashboardNavs: [], hasFetched: false, id: '1' };

const dashboardNavsSlice = createSlice({
  name: 'dashboardNavs',
  initialState: initialDashboardNavsState,
  reducers: {
    dashboardNavsLoaded: (state, action: PayloadAction<DashboardNav[]>): DashboardNavsState => {
      return { ...state, hasFetched: true, dashboardNavs: action.payload };
    },
    updateTab: (state, action: PayloadAction<string>): DashboardNavsState => {
      return { ...state, id: action.payload };
    },
  },
});

export const { dashboardNavsLoaded, updateTab } = dashboardNavsSlice.actions;
export const dashboardNavsReducer = dashboardNavsSlice.reducer;

export default {
  dashboardNavs: dashboardNavsReducer,
};
