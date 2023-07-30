import { AnyAction, combineReducers } from 'redux';

import sharedReducers from 'app/core/reducers';
import ldapReducers from 'app/features/admin/state/reducers';
import alertingReducers from 'app/features/alerting/state/reducers';
import apiKeysReducers from 'app/features/api-keys/state/reducers';
import panelEditorReducers from 'app/features/dashboard/components/PanelEditor/state/reducers';
import dashboardNavsReducer from 'app/features/dashboard/containers/state/reducers';
import dashboardReducers from 'app/features/dashboard/state/reducers';
import dataSourcesReducers from 'app/features/datasources/state/reducers';
import exploreReducers from 'app/features/explore/state/main';
import foldersReducers from 'app/features/folders/state/reducers';
import invitesReducers from 'app/features/invites/state/reducers';
import importDashboardReducers from 'app/features/manage-dashboards/state/reducers';
import organizationReducers from 'app/features/org/state/reducers';
import panelsReducers from 'app/features/panel/state/reducers';
import { reducer as pluginsReducer } from 'app/features/plugins/admin/state/reducer';
import userReducers from 'app/features/profile/state/reducers';
import serviceAccountsReducer from 'app/features/serviceaccounts/state/reducers';
import teamsReducers from 'app/features/teams/state/reducers';
import usersReducers from 'app/features/users/state/reducers';
import templatingReducers from 'app/features/variables/state/keyedVariablesReducer';

//Device Management
import configurationTypesReducer from 'app/features/devicemanagement/configurationtypes/state/reducers';
import bulksReducer from 'app/features/devicemanagement/bulks/state/reducers';
import groupsReducer from 'app/features/devicemanagement/groups/state/reducers';
import inventoriesReducer from 'app/features/devicemanagement/inventories/state/reducers';
import resourcesReducer from 'app/features/devicemanagement/resources/state/reducers';
import alertsReducer from 'app/features/devicemanagement/alerts/state/reducers';

//Billing Management
import connectionsReducer from 'app/features/billing/connections/state/reducers';
import fixedChargesReducer from 'app/features/billing/fixedcharges/state/reducers';
import profilesReducer from 'app/features/billing/profiles/state/reducers';

import { alertingApi } from '../../features/alerting/unified/api/alertingApi';
import { CleanUp, cleanUpAction } from '../actions/cleanUp';

const rootReducers = {
  ...sharedReducers,
  ...alertingReducers,
  ...teamsReducers,
  ...apiKeysReducers,
  ...foldersReducers,
  ...dashboardReducers,
  ...exploreReducers,
  ...dataSourcesReducers,
  ...usersReducers,
  ...serviceAccountsReducer,
  ...userReducers,
  ...invitesReducers,
  ...organizationReducers,
  ...ldapReducers,
  ...importDashboardReducers,
  ...panelEditorReducers,
  ...panelsReducers,
  ...templatingReducers,
  ...dashboardNavsReducer,

  ...inventoriesReducer,
  ...bulksReducer,
  ...resourcesReducer,
  ...groupsReducer,
  ...configurationTypesReducer,
  ...alertsReducer,
  
  ...profilesReducer,
  ...connectionsReducer,
  ...fixedChargesReducer,
  plugins: pluginsReducer,
  [alertingApi.reducerPath]: alertingApi.reducer,
};

const addedReducers = {};

export const addReducer = (newReducers: any) => {
  Object.assign(addedReducers, newReducers);
};

export const createRootReducer = () => {
  const appReducer = combineReducers({
    ...rootReducers,
    ...addedReducers,
  });

  return (state: any, action: AnyAction) => {
    if (action.type !== cleanUpAction.type) {
      return appReducer(state, action);
    }

    const { stateSelector } = action.payload as CleanUp<any>;
    const stateSlice = stateSelector(state);
    recursiveCleanState(state, stateSlice);

    return appReducer(state, action);
  };
};

export const recursiveCleanState = (state: any, stateSlice: any): boolean => {
  for (const stateKey in state) {
    if (!state.hasOwnProperty(stateKey)) {
      continue;
    }

    const slice = state[stateKey];
    if (slice === stateSlice) {
      state[stateKey] = undefined;
      return true;
    }

    if (typeof slice === 'object') {
      const cleaned = recursiveCleanState(slice, stateSlice);
      if (cleaned) {
        return true;
      }
    }
  }

  return false;
};
