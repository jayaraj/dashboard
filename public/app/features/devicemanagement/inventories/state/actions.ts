import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';
import { UpdateInventoryDTO, inventoriesPageLimit } from 'app/types/devicemanagement/inventory';

import { buildNavModel } from './navModel';
import {
  inventoryLoaded,
  inventoriesLoaded,
  setInventoriesSearchPage,
  setInventoriesCount,
  inventoryConfigurationLoaded,
  setInventoriesSearchQuery,
} from './reducers';

export function loadInventories(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().inventories;
    const response = await getBackendSrv().get('/api/inventories/search', {
      query: searchQuery,
      page: searchPage,
      perPage: inventoriesPageLimit,
    });
    dispatch(inventoriesLoaded(response.inventories));
    dispatch(setInventoriesCount(response.count));
  };
}

const loadInventoriesWithDebounce = debounce((dispatch) => dispatch(loadInventories()), 500);

export function changeInventoriesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setInventoriesSearchQuery(query));
    loadInventoriesWithDebounce(dispatch);
  };
}

export function changeInventoriesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setInventoriesSearchPage(page));
    dispatch(loadInventories());
  };
}

export function loadInventory(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/inventories/${id}`);
    dispatch(inventoryLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
  };
}

export function updateInventory(dto: UpdateInventoryDTO): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const inventory = getStore().inventory.inventory;
    await getBackendSrv().put(`/api/inventories/${inventory.id}`, {
      uuid: dto.uuid,
    });
    dispatch(loadInventory(inventory.id));
  };
}

export function deleteInventory(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/inventories/${id}`);
    dispatch(loadInventories());
  };
}

export function loadInventoryConfiguration(type: string): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const inventory = getStore().inventory.inventory;
    const response = await getBackendSrv().get(`/api/inventories/${inventory.id}/configurations/${type}`);
    dispatch(inventoryConfigurationLoaded(response));
  };
}

export function updateInventoryConfiguration(type: string, configuration: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const inventory = getStore().inventory.inventory;
    await getBackendSrv().put(`/api/inventories/${inventory.id}/configurations/${type}`, {
      configuration: configuration,
    });
    dispatch(loadInventoryConfiguration(type));
  };
}
