import { Inventory, InventoriesState, InventoryState } from 'app/types/devicemanagement/inventory';

export const getInventoriesSearchQuery = (state: InventoriesState) => state.searchQuery;
export const getInventoriesSearchPage = (state: InventoriesState) => state.searchPage;
export const getInventoriesCount = (state: InventoriesState) => state.inventoriesCount;
export const getInventories = (state: InventoriesState) => state.inventories;

export const getInventory = (state: InventoryState, currentInventoryId: any): Inventory | null => {
  if (state.inventory.id === parseInt(currentInventoryId, 10)) {
    return state.inventory;
  }
  return null;
};
