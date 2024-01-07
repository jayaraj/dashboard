import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import {
  fixedChargeLoaded,
  fixedChargesLoaded,
  setFixedChargesCount,
  setFixedChargesSearchPage,
  setFixedChargesSearchQuery,
} from './reducers';

export function loadFixedCharges(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().fixedCharges;
    const response = await getBackendSrv().get('/api/fixedcharges', {
      query: searchQuery,
      page: searchPage,
      perPage: fixedChargesLoaded,
    });
    dispatch(fixedChargesLoaded(response.fixed_charges));
    dispatch(setFixedChargesCount(response.count));
  };
}

const loadFixedChargesWithDebounce = debounce((dispatch) => dispatch(loadFixedCharges()), 500);
export function changeFixedChargesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setFixedChargesSearchQuery(query));
    loadFixedChargesWithDebounce(dispatch);
  };
}

export function changeFixedChargesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setFixedChargesSearchPage(page));
    dispatch(loadFixedCharges());
  };
}

export function loadFixedCharge(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/fixedcharges/${id}`);
    dispatch(fixedChargeLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateFixedCharge(tax: number, amount: number, description: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const fixedCharge = getStore().fixedCharge.fixedCharge;
    await getBackendSrv().put(`/api/fixedcharges/${fixedCharge.id}`, {
      id: fixedCharge.id,
      tax,
      amount,
      description,
    });
    dispatch(loadFixedCharge(fixedCharge.id));
  };
}

export function deleteFixedCharge(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/fixedcharges/${id}`);
    dispatch(loadFixedCharges());
  };
}
