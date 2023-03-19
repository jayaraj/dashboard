import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { QueryRange, ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import {
  groupLoaded,
  resourcesLoaded,
  groupsLoaded,
  setGroupPage,
  setGroupCount,
  setResourcePage,
  setResourceCount,
  usersLoaded,
  setUserPage,
  setUserCount,
  invoicesLoaded,
  setInvoicesPage,
  setInvoicesCount,
  transactionsLoaded,
  setTransactionsPage,
  setTransactionsCount,
  invoiceLoaded,
} from './reducers';

export function loadGroups(): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/groups', {});
    dispatch(groupsLoaded(response.groups));
    dispatch(setGroupPage(response.page));
    dispatch(setGroupCount(response.count));
  };
}

export function loadGroup(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/groups/${id}`);
    dispatch(groupLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
    dispatch(loadUsers('', 1, 10));
    dispatch(loadResources('', 1, 10));
  };
}

export function updateGroup(name: string, type: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().put(`/api/groups/${group.id}`, {
      name,
      type,
    });
    dispatch(loadGroup(group.id));
  };
}

export function deleteGroup(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groups/${id}`);
    dispatch(loadGroups());
  };
}

export function deleteChild(parent: number, id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/groups/${id}`);
    dispatch(loadGroup(parent));
  };
}

export function loadResources(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/resources`, {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(resourcesLoaded(response.group_resources));
    dispatch(setResourcePage(response.page));
    dispatch(setResourceCount(response.count));
  };
}

export function loadUsers(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/users`, {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(usersLoaded(response.group_users));
    dispatch(setUserPage(response.page));
    dispatch(setUserCount(response.count));
  };
}

export function addUser(userId: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().post(`/api/groups/${group.id}/users`, { user_id: userId });
    dispatch(loadUsers('', 1, perPage));
  };
}

export function deleteUser(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().delete(`/api/groups/${group.id}/users/${id}`);
    dispatch(loadUsers('', 1, perPage));
  };
}

export function deleteResource(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().delete(`/api/groups/${group.id}/resources/${id}`);
    dispatch(loadResources('', 1, perPage));
  };
}

export function loadInvoices(page: number, perPage: number, range: QueryRange): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/invoices`, {
      page: page,
      perPage: perPage,
      from: range.from,
      to: range.to,
    });
    dispatch(invoicesLoaded(response.invoices));
    dispatch(setInvoicesPage(response.page));
    dispatch(setInvoicesCount(response.count));
  };
}

export function loadInvoice(groupId: number, invoiceId: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/groups/${groupId}/invoices/${invoiceId}`);
    dispatch(invoiceLoaded(response));
  };
}

export function createInvoice(perPage: number, range: QueryRange): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().post(`/api/groups/${group.id}/invoices`);
    dispatch(loadInvoices(1, perPage, range));
  };
}

export function loadTransactions(page: number, perPage: number, range: QueryRange): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const group = getStore().group.group;
    const response = await getBackendSrv().get(`/api/groups/${group.id}/transactions`, {
      page: page,
      perPage: perPage,
      from: range.from,
      to: range.to,
    });
    dispatch(transactionsLoaded(response.transactions));
    dispatch(setTransactionsPage(response.page));
    dispatch(setTransactionsCount(response.count));
  };
}

export function createTransaction(type: string, tax: number, amount: number, description: string, context: any): ThunkResult<void> {
  return async (_, getStore) => {
    const group = getStore().group.group;
    await getBackendSrv().post(`/api/groups/${group.id}/transactions`,{
      type: type,
      tax: tax,
      amount: amount,
      description: description,
      context: context,
    });
  };
}

export function loadInvoiceTransactions(groupId: number, invoiceId: number, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/groups/${groupId}/invoices/${invoiceId}/transactions`, {
      page: page,
      perPage: perPage,
    });
    dispatch(transactionsLoaded(response.transactions));
    dispatch(setTransactionsPage(response.page));
    dispatch(setTransactionsCount(response.count));
  };
}