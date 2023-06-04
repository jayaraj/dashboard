import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import {CreateTransactionDTO, QueryRange, ThunkResult, UpdateConnectionDTO, connectionLogPageLimit, connectionPageLimit, invoicesPageLimit, transactionsPageLimit, connectionUserPageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import { connectionLoaded, connectionsLoaded, setConnectionsSearchPage, setConnectionLogsSearchPage, setConnectionLogsCount, connectionLogsLoaded, connectionUsersLoaded, setConnectionUsersSearchPage, setConnectionUsersCount, invoicesLoaded, setInvoicesSearchRange, setInvoicesSearchPage, setInvoicesCount, invoiceLoaded, transactionsLoaded, setTransactionsSearchPage, setTransactionsCount, setConnectionsCount, orgConfigurationsLoaded } from './reducers';

export function loadConnections(query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/connections', {
      query: query,
      page: page,
      perPage: connectionPageLimit,
    });
    dispatch(connectionsLoaded(response.connections));
    dispatch(setConnectionsSearchPage(response.page));
    dispatch(setConnectionsCount(response.count));
  };
}

export function loadConnection(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/connections/${id}`);
    dispatch(connectionLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateConnection(dto: UpdateConnectionDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().put(`/api/connections/${connection.id}`, {
      id: connection.id,
      profile: dto.profile,
      status: dto.status,
      name: dto.name,
      phone: dto.phone,
      email: dto.email,
      address1: dto.address1,
      address2: dto.address2,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      pincode: dto.pincode,
    });
    dispatch(loadConnection(connection.id));
  };
}

export function deleteConnection(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/connections/${id}`);
    dispatch(loadConnections('', 1));
  };
}

export function loadConnectionLogs(page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/logs`, {
      page: page,
      perPage: connectionLogPageLimit,
    });
    dispatch(connectionLogsLoaded(response.logs));
    dispatch(setConnectionLogsSearchPage(response.page));
    dispatch(setConnectionLogsCount(response.count));
  };
}

export function loadConnectionUsers(page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/users`, {
      page: page,
      perPage: connectionUserPageLimit,
    });
    dispatch(connectionUsersLoaded(response.group_users));
    dispatch(setConnectionUsersSearchPage(response.page));
    dispatch(setConnectionUsersCount(response.count));
  };
}

export function deleteConnectionUser(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().delete(`/api/connections/${connection.id}/users/${id}`);
    dispatch(loadConnectionUsers(1));
  };
}

export function loadInvoices(page: number, range: QueryRange): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/invoices`, {
      page: page,
      perPage: invoicesPageLimit,
      from: range.from,
      to: range.to,
    });
    dispatch(invoicesLoaded(response.invoices));
    dispatch(setInvoicesSearchRange(range));
    dispatch(setInvoicesSearchPage(response.page));
    dispatch(setInvoicesCount(response.count));
  };
}

export function loadInvoice(invoiceId: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/invoices/${invoiceId}`);
    dispatch(invoiceLoaded(response));
  };
}

export function createInvoice(range: QueryRange): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().post(`/api/connections/${connection.id}/invoices`);
    dispatch(loadInvoices(1, range));
  };
}

export function loadTransactions(page: number, range: QueryRange): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/transactions`, {
      page: page,
      perPage: transactionsPageLimit,
      from: range.from,
      to: range.to,
    });
    dispatch(transactionsLoaded(response.transactions));
    dispatch(setTransactionsSearchPage(response.page));
    dispatch(setTransactionsCount(response.count));
  };
}

export function createTransaction(dto: CreateTransactionDTO): ThunkResult<void> {
  return async (_, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().post(`/api/connections/${connection.id}/transactions`,{
      type: dto.type,
      tax: dto.tax,
      amount: dto.amount,
      description: dto.description,
      context: dto.contexts,
    });
  };
}

export function loadInvoiceTransactions(page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const invoice = getStore().invoice.invoice;
    const response = await getBackendSrv().get(`/api/invoices/${invoice.id}/transactions`, {
      page: page,
      perPage: transactionsPageLimit,
    });
    dispatch(transactionsLoaded(response.transactions));
  };
}

export function loadOrgConfigurations(type: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/orgs/configurations/${type}`);
    dispatch(orgConfigurationsLoaded(response));
  };
}
