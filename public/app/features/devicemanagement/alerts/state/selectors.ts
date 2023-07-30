import { Alert, AlertDefinition, AlertDefinitionState, AlertDefinitionsState, AlertState, AlertingState, AlertsState } from 'app/types';


export const getAlertsByNameSearchPage = (state: AlertsState, name: string) => state.alertsByNamePage[name]? state.alertsByNamePage[name]: 1;
export const getAlertsByNameStats = (state:AlertsState, name: string) => state.alertsByNameStats[name]? state.alertsByNameStats[name]: {count: 0, alerting: 0, pending: 0, normal: 0};
export const getAlertsByNameLoaded = (state:AlertsState, name: string) => state.alertsByNameHasFetched[name]? state.alertsByNameHasFetched[name]: false;
export const getAlertsByName = (state: AlertsState, name: string) => state.alertsByName[name]? state.alertsByName[name]: [];

export const getAlertsByStateSearchPage = (state: AlertsState, alertingState: AlertingState) => state.alertsByStatePage[alertingState];
export const getAlertsByStateStats = (state:AlertsState, alertingState: AlertingState) => state.alertsByStateStats[alertingState];
export const getAlertsByStateLoaded = (state:AlertsState, alertingState: AlertingState) => state.alertsByStateHasFetched[alertingState];
export const getAlertsByState = (state: AlertsState, alertingState: AlertingState) => state.alertsByState[alertingState];

export const getAlertDefinitionsSearchQuery = (state: AlertDefinitionsState) => state.searchQuery;
export const getAlertDefinitionsSearchPage = (state: AlertDefinitionsState) => state.searchPage;
export const getAlertDefinitionsStats = (state:AlertDefinitionsState) => state.alertDefinitionsStats;
export const getAlertDefinitionsLoaded = (state:AlertDefinitionsState) => state.hasFetched;
export const getAlertDefinitions = (state: AlertDefinitionsState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.alertDefinitions.filter((alert) => {
    return regex.test(alert.name);
  });
};

export const getAlertDefinition = (state: AlertDefinitionState, currentAlertDefinitionId: any): AlertDefinition | null => {
  if (state.alertDefinition.id === parseInt(currentAlertDefinitionId, 10)) {
    return state.alertDefinition;
  }
  return null;
};

export const getAlert = (state: AlertState, currentAlertId: any): Alert | null => {
  if (state.alert.id === parseInt(currentAlertId, 10)) {
    return state.alert;
  }
  return null;
};
