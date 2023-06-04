import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult, UpdateInventoryDTO, inventoryPageLimit } from 'app/types';

import { buildNavModel } from './navModel';
import { 
  inventoryLoaded, 
  inventoriesLoaded, 
  setInventoriesSearchPage, 
  setInventoriesCount,
  inventoryConfigurationLoaded
} from './reducers';

export function loadInventories(query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/inventories/search', {
      query: query,
      page: page,
      perPage: inventoryPageLimit,
    });
    dispatch(inventoriesLoaded(response.inventories));
    dispatch(setInventoriesSearchPage(response.page));
    dispatch(setInventoriesCount(response.count));
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
    dispatch(loadInventories('', 1));
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

export function deleteInventoryConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const configuration = getStore().inventoryConfiguration.configuration;
    const inventory = getStore().inventory.inventory;
    await getBackendSrv().delete(`/api/inventoryconfigurations/${configuration.id}`);
    dispatch(loadInventoryConfiguration(inventory.type));
  };
}