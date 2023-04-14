import { getBackendSrv } from '@grafana/runtime';
import { updateNavIndex } from 'app/core/actions';
import { ThunkResult } from 'app/types';

import { buildNavModel } from './navModel';
import { 
  inventoryLoaded, 
  inventoriesLoaded, 
  setInventorySearchPage, 
  setInventoryCount, 
  resourceTypeConfigurationLoaded
} from './reducers';

export function loadInventories(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/inventories/search', {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(inventoriesLoaded(response.inventories));
    dispatch(setInventorySearchPage(response.page));
    dispatch(setInventoryCount(response.count));
  };
}

export function loadInventory(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/inventories/${id}`);
    dispatch(inventoryLoaded(response));
    dispatch(updateNavIndex(buildNavModel(response)));
    dispatch(loadResourceTypeConfiguration());
  };
}

export function updateInventory(uuid: string, type: string, configuration: any): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const inventory = getStore().inventory.inventory;
    await getBackendSrv().put(`/api/inventories/${inventory.id}`, {
      id: inventory.id,
      uuid,
    });
    await getBackendSrv().put(`/api/inventories/${inventory.id}/configurations/${type}`, {
      configuration,
    });
    dispatch(loadInventory(inventory.id));
  };
}



export function deleteInventory(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/inventories/${id}`);
    dispatch(loadInventories('', 1, perPage));
  };
}

export function loadResourceTypeConfiguration(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const inventory = getStore().inventory.inventory;
    const response = await getBackendSrv().get(`/api/resourcetypes/type/${inventory.type}`);
    dispatch(resourceTypeConfigurationLoaded(response));
  };
}
