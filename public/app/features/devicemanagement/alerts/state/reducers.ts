import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Alert, AlertsState, AlertDefinitionState, AlertDefinition, AlertState, AlertDefinitionsState, AlertingState, AlertStats } from 'app/types';

const initialAlertStats: AlertStats = {count: 0, alerting: 0, pending: 0, normal: 0}

export const initialAlertsState: AlertsState = {
  alertsByName: {},
  alertsByState: {[AlertingState.Alerting]: [] as Alert[], [AlertingState.Pending]: [] as Alert[], [AlertingState.Normal]: [] as Alert[]},
  alertsByNameStats: {},
  alertsByNameHasFetched: {},
  alertsByStateStats: {[AlertingState.Alerting]: initialAlertStats, [AlertingState.Pending]: initialAlertStats, [AlertingState.Normal]: initialAlertStats},
  alertsByStateHasFetched: {[AlertingState.Alerting]: false, [AlertingState.Pending]: false, [AlertingState.Normal]: false},
  alertsByNamePage: {},
  alertsByStatePage: {[AlertingState.Alerting]: 1, [AlertingState.Pending]: 1, [AlertingState.Normal]: 1},
};

const alertsSlice = createSlice({
  name: 'alerts',
  initialState: initialAlertsState,
  reducers: {
    alertsByNameLoaded: (state, action: PayloadAction<{name: string, alerts: Alert[]}>): AlertsState => {
      return { ...state, alertsByNameHasFetched: {...state.alertsByNameHasFetched, [action.payload.name]: true}, alertsByName: {...state.alertsByName, [action.payload.name]: action.payload.alerts}};
    },
    alertsByStateLoaded: (state, action: PayloadAction<{alertingState: AlertingState, alerts: Alert[]}>): AlertsState => {
      return { ...state, alertsByStateHasFetched: {...state.alertsByStateHasFetched, [action.payload.alertingState]: true}, alertsByState: { ...state.alertsByState,  [action.payload.alertingState]: action.payload.alerts} };
    },
    setAlertsByNameFetched: (state, action: PayloadAction<{name: string, fetched: boolean}>): AlertsState => {
      return { ...state, alertsByNameHasFetched: {...state.alertsByNameHasFetched, [action.payload.name]: action.payload.fetched} };
    },
    setAlertsByStateFetched: (state, action: PayloadAction<{alertingState: AlertingState, fetched: boolean}>): AlertsState => {
      return { ...state, alertsByStateHasFetched: {...state.alertsByStateHasFetched, [action.payload.alertingState]: action.payload.fetched} };
    },
    setAlertsByNameStats: (state, action: PayloadAction<{name: string, stats: AlertStats}>): AlertsState => {
      return { ...state, alertsByNameStats: {...state.alertsByNameStats, [action.payload.name]: action.payload.stats} };
    },
    setAlertsByStateStats: (state, action: PayloadAction<{alertingState: AlertingState, stats: AlertStats}>): AlertsState => {
      return { ...state, alertsByStateStats: {...state.alertsByStateStats, [action.payload.alertingState]: action.payload.stats} };
    },
    setAlertsByNamePage: (state, action: PayloadAction<{name: string, page: number}>): AlertsState => {
      return { ...state, alertsByNamePage: {...state.alertsByNamePage, [action.payload.name]: action.payload.page} };
    },
    setAlertsByStatePage: (state, action: PayloadAction<{alertingState: AlertingState, page: number}>): AlertsState => {
      return { ...state, alertsByStatePage: {...state.alertsByStatePage, [action.payload.alertingState]: action.payload.page} };
    },
  },
});
export const { alertsByNameLoaded, alertsByStateLoaded, setAlertsByNameFetched, setAlertsByStateFetched, setAlertsByNameStats, setAlertsByStateStats, setAlertsByNamePage, setAlertsByStatePage } =
  alertsSlice.actions;
export const alertsReducer = alertsSlice.reducer;

export const initialAlertState: AlertState = {
  alert: {} as Alert,
};
const alertSlice = createSlice({
  name: 'alert',
  initialState: initialAlertState,
  reducers: {
    alertLoaded: (state, action: PayloadAction<Alert>): AlertState => {
      return { ...state, alert: action.payload };
    },
  },
});
export const { alertLoaded } = alertSlice.actions;
export const alertReducer = alertSlice.reducer;

export const initialAlertDefinitionsState: AlertDefinitionsState = {
  alertDefinitions: [],
  alertDefinitionsStats: initialAlertStats,
  searchPage: 1,
  searchQuery: '',
  hasFetched: false,
};
const alertDefinitionsSlice = createSlice({
  name: 'alertDefinitions',
  initialState: initialAlertDefinitionsState,
  reducers: {
    alertDefinitionsLoaded: (state, action: PayloadAction<AlertDefinition[]>): AlertDefinitionsState => {
      return { ...state, hasFetched: true, alertDefinitions: action.payload };
    },
    setAlertDefinitionsFetched: (state, action: PayloadAction<boolean>): AlertDefinitionsState => {
      return { ...state, hasFetched: action.payload, };
    },
    setAlertDefinitionsSearchQuery: (state, action: PayloadAction<string>): AlertDefinitionsState => {
      return { ...state, searchQuery: action.payload };
    },
    setAlertDefinitionsSearchPage: (state, action: PayloadAction<number>): AlertDefinitionsState => {
      return { ...state, searchPage: action.payload };
    },
    setAlertDefinitionsStats: (state, action: PayloadAction<AlertStats>): AlertDefinitionsState => {
      return { ...state, alertDefinitionsStats: action.payload };
    },
  },
});
export const { alertDefinitionsLoaded, setAlertDefinitionsSearchQuery, setAlertDefinitionsFetched, setAlertDefinitionsSearchPage, setAlertDefinitionsStats } =
alertDefinitionsSlice.actions;
export const alertDefinitionsReducer = alertDefinitionsSlice.reducer;


export const initialAlertDefinitionState: AlertDefinitionState = {
  alertDefinition: {} as AlertDefinition,
};
const alertDefinitionSlice = createSlice({
  name: 'alertDefinition',
  initialState: initialAlertDefinitionState,
  reducers: {
    alertDefinitionLoaded: (state, action: PayloadAction<AlertDefinition>): AlertDefinitionState => {
      return { ...state, alertDefinition: action.payload };
    },
  },
});
export const { alertDefinitionLoaded } = alertDefinitionSlice.actions;
export const alertDefinitionReducer = alertDefinitionSlice.reducer;

export type AlertsReducerState = ReturnType<typeof alertsReducer>;
export type AlertDefinitionsReducerState = ReturnType<typeof alertDefinitionsReducer>;

export default {
  alerts: alertsReducer,
  alert: alertReducer,
  alertDefinitions: alertDefinitionsReducer,
  alertDefinition: alertDefinitionReducer,
};
