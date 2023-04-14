import { ResourceType } from "./resourceType";

export interface Inventory {
  id: number;
  type: string;
  uuid: string;
}

export interface InventoriesState {
  inventories: Inventory[];
  inventoriesCount: number;
  searchQuery: string;
  page: number;
  hasFetched: boolean;
}

export interface InventoryState {
  inventory: Inventory;
  type: ResourceType;
}
