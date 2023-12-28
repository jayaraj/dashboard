import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';
import {
  AlertStats,
  UpdateAlertDefinitionDTO,
  AlertsByStateDTO,
  AlertDefinitionDTO,
  AlertsByNameDTO,
  alertDefinitionsPageLimit,
  AlertingState,
  alertsPageLimit,
  UpdateNotificationDTO,
  EnableAlertDTO,
  ConfigureAlertDTO,
} from 'app/types/devicemanagement/alert';

import { buildNavModel } from './navModel';
import {
  alertDefinitionLoaded,
  alertDefinitionsLoaded,
  alertNotificationLoaded,
  alertsByNameLoaded,
  alertsByStateLoaded,
  setAlertDefinitionsSearchPage,
  setAlertDefinitionsStats,
  setAlertsByNamePage,
  setAlertsByNameStats,
  setAlertsByStatePage,
  setAlertsByStateStats,
} from './reducers';

export function loadAlertsByName(dto: AlertsByNameDTO): ThunkResult<void> {
  return async (dispatch) => {
    let args: any = {
      query: dto.query,
      page: dto.page,
      perPage: alertsPageLimit,
      name: dto.name,
      [dto.association as string]: dto.associationReference,
    };
    if (dto.state !== '') {
      args.state = dto.state;
    }
    const response = await getBackendSrv().get(`/api/grafoalerts/search`, args);
    const stats: AlertStats = {
      count: response.count,
      alerting: response.alerting,
      pending: response.pending,
      normal: response.normal,
    };
    dispatch(alertsByNameLoaded({ name: dto.name, alerts: response.alerts }));
    dispatch(setAlertsByNamePage({ name: dto.name, page: response.page }));
    dispatch(setAlertsByNameStats({ name: dto.name, stats: stats }));
  };
}

export function loadAlertsByState(dto: AlertsByStateDTO): ThunkResult<void> {
  return async (dispatch) => {
    let args: any = {
      query: dto.query,
      page: dto.page,
      perPage: alertsPageLimit,
      state: dto.state,
      [dto.association as string]: dto.associationReference,
    };
    const response = await getBackendSrv().get('/api/grafoalerts/search', args);
    const stats: AlertStats = {
      count: response.count,
      alerting: response.alerting,
      pending: response.pending,
      normal: response.normal,
    };
    dispatch(alertsByStateLoaded({ alertingState: dto.state as AlertingState, alerts: response.alerts }));
    dispatch(setAlertsByStatePage({ alertingState: dto.state as AlertingState, page: response.page }));
    dispatch(setAlertsByStateStats({ alertingState: dto.state as AlertingState, stats: stats }));
  };
}

export function loadAlertDefinitions(dto: AlertDefinitionDTO): ThunkResult<void> {
  return async (dispatch) => {
    let args: any = {
      query: dto.query,
      page: dto.page,
      perPage: alertDefinitionsPageLimit,
      [dto.association as string]: dto.associationReference,
    };
    if (dto.state !== '') {
      args.state = dto.state;
    }
    const response = await getBackendSrv().get('/api/alertdefinitions/search', args);
    const stats: AlertStats = {
      count: response.count,
      alerting: response.alerting,
      pending: response.pending,
      normal: response.normal,
    };
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

export function configureAlert(dto: ConfigureAlertDTO): ThunkResult<void> {
  return async () => {
    let args: any = {
      name: dto.name,
      configuration: dto.configuration,
    };
    switch (dto.association) {
      case 'group':
        args.group_path = dto.alert ? dto.alert.group_path : dto.associationReference;
        break;
      case 'resource':
        args.resource_id = dto.alert ? dto.alert.resource_id : dto.associationReference;
        break;
    }
    await getBackendSrv().put(`/api/grafoalerts/configuration`, args);
  };
}

export function enableAlert(dto: EnableAlertDTO): ThunkResult<void> {
  return async () => {
    let args: any = {
      name: dto.name,
      enabled: dto.enabled,
    };
    switch (dto.association) {
      case 'group':
        args.group_path = dto.alert ? dto.alert.group_path : dto.associationReference;
        break;
      case 'resource':
        args.resource_id = dto.alert ? dto.alert.resource_id : dto.associationReference;
        break;
    }
    await getBackendSrv().put(`/api/grafoalerts/enabled`, args);
  };
}

export function updateNotification(dto: UpdateNotificationDTO): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().post(`/api/alertnotifications`, {
      alert_definition_id: dto.alert_definition_id,
      configuration: dto.configuration,
    });
    dispatch(loadNotification(dto.name));
  };
}

export function loadNotification(name: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/alertnotifications/${name}`);
    dispatch(alertNotificationLoaded(response));
  };
}
