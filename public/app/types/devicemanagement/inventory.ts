export const inventoryPageLimit = 50;

export interface Inventory {
  id: number;
  type: string;
  uuid: string;
  resource_name: string;
  resource_org: number;
  assigned: boolean;
}

export interface CreateInventoryDTO {
  type: string;
  uuid: string;
}

export interface UpdateInventoryDTO {
  uuid: string;
}

export interface InventoriesState {
  inventories: Inventory[];
  inventoriesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface InventoryState {
  inventory: Inventory;
}
