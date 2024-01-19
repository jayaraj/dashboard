import { debounce } from 'lodash';

import { AppEvents } from '@grafana/data';
import { getBackendSrv, locationService } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { appEvents } from 'app/core/core';
import { ThunkResult } from 'app/types';
import {
  CreateTransactionDTO,
  QueryRange,
  UpdateConnectionDTO,
  connectionLogsPageLimit,
  connectionsPageLimit,
  invoicesPageLimit,
  transactionsPageLimit,
  connectionUsersPageLimit,
  connectionResourcesPageLimit,
  Connection,
} from 'app/types/billing/connection';

import { buildNavModel } from './navModel';
import {
  connectionLoaded,
  connectionsLoaded,
  setConnectionsSearchPage,
  setConnectionLogsSearchPage,
  setConnectionLogsCount,
  connectionLogsLoaded,
  connectionUsersLoaded,
  setConnectionUsersSearchPage,
  setConnectionUsersCount,
  invoicesLoaded,
  setInvoicesSearchRange,
  setInvoicesSearchPage,
  setInvoicesCount,
  invoiceLoaded,
  transactionsLoaded,
  setTransactionsSearchPage,
  setTransactionsCount,
  setConnectionsCount,
  connectionResourcesLoaded,
  setConnectionResourcesSearchPage,
  setConnectionResourcesCount,
  setConnectionsSearchQuery,
  setTransactionsSearchRange,
  invoiceTransactionsLoaded,
  setInvoiceTransactionsCount,
  setInvoiceTransactionsSearchPage,
  setConnectionResourcesSearchQuery,
  setConnectionUsersSearchQuery,
  orgConfigurationLoaded,
  setHasInvoiceFetched,
} from './reducers';

export function loadConnections(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().connections;
    const response = await getBackendSrv().get('/api/connections', {
      query: searchQuery,
      page: searchPage,
      perPage: connectionsPageLimit,
    });
    dispatch(connectionsLoaded(response.connections));
    dispatch(setConnectionsCount(response.count));
  };
}

const loadConnectionsWithDebounce = debounce((dispatch) => dispatch(loadConnections()), 500);
export function changeConnectionsQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionsSearchQuery(query));
    loadConnectionsWithDebounce(dispatch);
  };
}

export function changeConnectionsPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionsSearchPage(page));
    dispatch(loadConnections());
  };
}

export function loadConnection(id: number): ThunkResult<void> {
  return async (dispatch) => {
    let response = await getBackendSrv().get(`/api/connections/${id}`);
    const groupPathName = await getBackendSrv().get(`/api/groups/${response.group_id}/pathname`);
    response = { ...response, pathname: groupPathName.pathname };
    dispatch(loadConnectionTags(response));
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
      latitude: Number(dto.latitude),
      longitude: Number(dto.longitude),
    });
    dispatch(loadConnection(connection.id));
  };
}

export function updateConnectionTags(tags: string[]): ThunkResult<void> {
  return async (_, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().put(`/api/groups/${connection.group_id}/tags`, {
      tags: tags,
    });
  };
}

export function deleteConnection(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/connections/${id}`);
    dispatch(loadConnections());
  };
}

export function loadConnectionLogs(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const { searchPage } = getStore().connectionLogs;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/logs`, {
      page: searchPage,
      perPage: connectionLogsPageLimit,
    });
    dispatch(connectionLogsLoaded(response.logs));
    dispatch(setConnectionLogsCount(response.count));
  };
}

export function changeConnectionLogsPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionLogsSearchPage(page));
    dispatch(loadConnectionLogs());
  };
}

export function loadConnectionUsers(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const { searchPage, searchQuery } = getStore().connectionUsers;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/users`, {
      page: searchPage,
      query: searchQuery,
      perPage: connectionUsersPageLimit,
    });
    dispatch(connectionUsersLoaded(response.group_users));
    dispatch(setConnectionUsersCount(response.count));
  };
}

const loadConnectionUsersWithDebounce = debounce((dispatch) => dispatch(loadConnectionUsers()), 500);
export function changeConnectionUsersQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionUsersSearchQuery(query));
    loadConnectionUsersWithDebounce(dispatch);
  };
}

export function changeConnectionUsersPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionUsersSearchPage(page));
    dispatch(loadConnectionUsers());
  };
}

export function deleteConnectionUser(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const response: { org_id: number } = await getBackendSrv().delete(`/api/connections/${connection.id}/users/${id}`);
    appEvents.emit(AppEvents.alertSuccess, ['deleted']);
    if (response.org_id !== 0) {
      locationService.push(`/?orgId=${response.org_id}`);
      window.location.reload();
      return;
    }
    dispatch(loadConnectionUsers());
  };
}

export function loadConnectionResources(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const { searchPage, searchQuery } = getStore().connectionResources;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/resources`, {
      page: searchPage,
      query: searchQuery,
      perPage: connectionResourcesPageLimit,
    });
    dispatch(connectionResourcesLoaded(response.group_resources));
    dispatch(setConnectionResourcesCount(response.count));
  };
}

const loadConnectionResourcesWithDebounce = debounce((dispatch) => dispatch(loadConnectionResources()), 500);
export function changeConnectionResourcesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionResourcesSearchQuery(query));
    loadConnectionResourcesWithDebounce(dispatch);
  };
}

export function changeConnectionResourcesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setConnectionResourcesSearchPage(page));
    dispatch(loadConnectionResources());
  };
}

export function deleteConnectionResource(resourceId: number, resourceUUID: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().delete(`/api/connections/${connection.id}/resources/${resourceId}?uuid=${resourceUUID}`);
    dispatch(loadConnectionResources());
  };
}

export function cleanResourceData(id: number): ThunkResult<void> {
  return async () => {
    await getBackendSrv().post(`/api/resources/${id}/cleandata`);
  };
}

export function loadInvoices(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const { searchPage, searchRange } = getStore().invoices;
    setHasInvoiceFetched(false);
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/invoices`, {
      page: searchPage,
      perPage: invoicesPageLimit,
      from: searchRange.from,
      to: searchRange.to,
    });
    dispatch(invoicesLoaded(response.invoices));
    dispatch(setInvoicesCount(response.count));
  };
}

export function changeInvoicesRange(range: QueryRange): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setInvoicesSearchRange(range));
    dispatch(loadInvoices());
  };
}

export function changeInvoicesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setInvoicesSearchPage(page));
    dispatch(loadInvoices());
  };
}

export function loadInvoice(invoiceId: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/invoices/${invoiceId}`);
    dispatch(invoiceLoaded(response));
  };
}

export function createInvoice(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().post(`/api/connections/${connection.id}/invoices`);
    dispatch(loadInvoices());
  };
}

export function loadTransactions(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const connection = getStore().connection.connection;
    const { searchPage, searchRange } = getStore().transactions;
    const response = await getBackendSrv().get(`/api/connections/${connection.id}/transactions`, {
      page: searchPage,
      perPage: transactionsPageLimit,
      from: searchRange.from,
      to: searchRange.to,
    });
    dispatch(transactionsLoaded(response.transactions));
    dispatch(setTransactionsCount(response.count));
  };
}

export function changeTransactionsRange(range: QueryRange): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setTransactionsSearchRange(range));
    dispatch(loadTransactions());
  };
}

export function changeTransactionsPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setTransactionsSearchPage(page));
    dispatch(loadTransactions());
  };
}

export function createTransaction(dto: CreateTransactionDTO): ThunkResult<void> {
  return async (_, getStore) => {
    const connection = getStore().connection.connection;
    await getBackendSrv().post(`/api/connections/${connection.id}/transactions`, {
      type: dto.type,
      tax: dto.tax,
      amount: dto.amount,
      description: dto.description,
      context: dto.contexts,
    });
  };
}

export function loadInvoiceTransactions(invoiceId: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/invoices/${invoiceId}/transactions`, {
      page: 1,
      perPage: transactionsPageLimit,
    });
    dispatch(invoiceTransactionsLoaded(response.transactions));
    dispatch(setInvoiceTransactionsCount(response.count));
    dispatch(setHasInvoiceFetched(true));
  };
}

export function changeInvoiceTransactionsPage(page: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const invoice = getStore().invoice.invoice;
    dispatch(setInvoiceTransactionsSearchPage(page));
    dispatch(loadInvoiceTransactions(invoice.id));
  };
}

export function loadOrgConfigurations(type: string): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/orgs/configurations/${type}`);
    dispatch(orgConfigurationLoaded(response));
  };
}

export function loadConnectionTags(connection: Connection): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/groups/${connection.group_id}/tags/search`, {
      page: 1,
      perPage: 1000,
    });
    dispatch(connectionLoaded({ ...connection, tags: response.tags.map(({ tag }: { tag: string }) => tag) }));
  };
}
