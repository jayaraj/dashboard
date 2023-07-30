import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import {AlertStats, ThunkResult, UpdateAlertDefinitionDTO, alertDefinitionPageLimit  } from 'app/types';

import { buildNavModel } from './navModel';
import { AlertingState, alertPageLimit } from 'app/types/devicemanagement/alert';
import { alertDefinitionLoaded, alertDefinitionsLoaded, alertLoaded, alertsByNameLoaded, alertsByStateLoaded, setAlertDefinitionsSearchPage, setAlertDefinitionsStats, setAlertsByNamePage, setAlertsByNameStats, setAlertsByStatePage, setAlertsByStateStats } from './reducers';

export function loadAlertsByName(name: string, page: number, association?: string, state?: string, query?: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    let args: any = {
      query: query,
      page: page,
      perPage: alertPageLimit,
      name: name,
    }
    if (state !== '') {
      args.state = state;
    }
    switch (association) {
      case 'group':
        const gg = getStore().group.group;
        args.group = gg.path
        break;
      case 'resource':
        const rr = getStore().resource.resource;
        args.resource = rr.id
        break;
      case 'connection':
        const cc = getStore().connection.connection;
        args.group = cc.group_path_id;
        break;
    }
    const response = await getBackendSrv().get(`/api/grafo/alerts/search`, args);
    const stats: AlertStats = {count: response.count, alerting: response.alerting, pending: response.pending, normal: response.normal};
    dispatch(alertsByNameLoaded({name: name, alerts: response.alerts}));
    dispatch(setAlertsByNamePage({name: name, page: response.page}));
    dispatch(setAlertsByNameStats({name: name, stats: stats}));
  };
}

export function loadAlertsByState( state: string, page: number, association?: string, query?: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    let args: any = {
      query: query,
      page: page,
      perPage: alertPageLimit,
      state: state,
    };
    switch (association) {
      case 'group':
        const gg = getStore().group.group;
        args.group = gg.path
        break;
      case 'resource':
        const rr = getStore().resource.resource;
        args.resource = rr.id
        break;
      case 'connection':
        const cc = getStore().connection.connection;
        args.group = cc.group_path_id;
        break;
    }
    const response = await getBackendSrv().get('/api/grafo/alerts/search', args);
    const stats: AlertStats = {count: response.count, alerting: response.alerting, pending: response.pending, normal: response.normal};
    dispatch(alertsByStateLoaded({alertingState: state as AlertingState, alerts: response.alerts}));
    dispatch(setAlertsByStatePage({alertingState: state as AlertingState, page: response.page}));
    dispatch(setAlertsByStateStats({alertingState: state as AlertingState, stats: stats}));
  };
}

export function loadAlertDefinitions(page: number, association?: string, state?: string, query?: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    let args: any = {
      query: query,
      page: page,
      perPage: alertDefinitionPageLimit,
    };
    if (state !== '') {
      args.state = state;
    }
    switch (association) {
      case 'group':
        const gg = getStore().group.group;
        args.group = gg.path
        break;
      case 'resource':
        const rr = getStore().resource.resource;
        args.resource = rr.id
        break;
      case 'connection':
        const cc = getStore().connection.connection;
        args.group = cc.group_path_id;
        break;
    }
    const response = await getBackendSrv().get('/api/alertdefinitions/search', args);
    const stats: AlertStats = {count: response.count, alerting: response.alerting, pending: response.pending, normal: response.normal};
    dispatch(alertDefinitionsLoaded(response.alert_definitions));
    dispatch(setAlertDefinitionsSearchPage(response.page));
    dispatch(setAlertDefinitionsStats(stats));
  };
}

export function loadAlertDefinition(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/alertdefinitions/${id}`);
    dispatch(alertDefinitionLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function loadAlert(name: string, association: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    let args: any = {};
    switch (association) {
      case 'group':
        const gg = getStore().group.group;
        args.group = gg.path
        break;
      case 'resource':
        const rr = getStore().resource.resource;
        args.resource = rr.id
        break;
      case 'connection':
        const cc = getStore().connection.connection;
        args.group = cc.group_path_id;
        break;
    }
    const response = await getBackendSrv().get(`/api/grafo/alerts/${name}`, args);
    dispatch(alertLoaded(response))
  };
}

export function updateAlertDefinition(dto: UpdateAlertDefinitionDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const alertDefinition = getStore().alertDefinition.alertDefinition;
    await getBackendSrv().put(`/api/alertdefinitions/${alertDefinition.id}`, {
      id: alertDefinition.id,
      name: dto.name,
      description: dto.description,
      alerting_msg: dto.alerting_msg,
      ok_msg: dto.ok_msg,
      associated_with: dto.associated_with,
      role: dto.role,
      severity: dto.severity,
      for: dto.for,
      ticket_enabled: dto.ticket_enabled,
      configuration: dto.configuration,
    });
    dispatch(loadAlertDefinition(alertDefinition.id));
  };
}

export function configureAlert(name: string, configuration: any, association: string): ThunkResult<void> {
  return async (_, getStore) => {
    let args: any = {
      name: name,
      configuration: configuration,
    };
    switch (association) {
      case 'group':
        const gg = getStore().group.group;
        args.group = gg.path
        break;
      case 'resource':
        const rr = getStore().resource.resource;
        args.resource = rr.id
        break;
      case 'connection':
        const cc = getStore().connection.connection;
        args.group = cc.group_path_id;
        break;
    }
    await getBackendSrv().put(`/api/grafo/alerts/configuration`, args);
  };
}

export function enableAlert(name: string, enabled: boolean, association: string): ThunkResult<void> {
  return async (_, getStore) => {
    let args: any = {
      name: name,
      enabled: enabled,
    };
    switch (association) {
      case 'group':
        const gg = getStore().group.group;
        args.group = gg.path
        break;
      case 'resource':
        const rr = getStore().resource.resource;
        args.resource = rr.id
        break;
      case 'connection':
        const cc = getStore().connection.connection;
        args.group = cc.group_path_id;
        break;
    }
    await getBackendSrv().put(`/api/grafo/alerts/enabled`, args);
  };
}
