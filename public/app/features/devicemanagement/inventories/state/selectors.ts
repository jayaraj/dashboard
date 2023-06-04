import { Inventory, InventoriesState, InventoryState } from 'app/types';

export const getInventoriesSearchQuery = (state: InventoriesState) => state.searchQuery;
export const getInventoriesSearchPage = (state: InventoriesState) => state.searchPage;
export const getInventoriesCount = (state: InventoriesState) => state.inventoriesCount;

export const getInventory = (state: InventoryState, currentInventoryId: any): Inventory | null => {
  if (state.inventory.id === parseInt(currentInventoryId, 10)) {
    return state.inventory;
  }
  return null;
};

export const getInventories = (state: InventoriesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.inventories.filter((inventory) => {
    return regex.test(inventory.type);
  });
};
