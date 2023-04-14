import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Inventory, InventoriesState, InventoryState, ResourceType } from 'app/types';

export const initialInventoriesState: InventoriesState = {
  inventories: [],
  inventoriesCount: 0,
  page: 1,
  searchQuery: '',
  hasFetched: false,
};

const inventoriesSlice = createSlice({
  name: 'inventories',
  initialState: initialInventoriesState,
  reducers: {
    inventoriesLoaded: (state, action: PayloadAction<Inventory[]>): InventoriesState => {
      return { ...state, hasFetched: true, inventories: action.payload };
    },
    setSearchQuery: (state, action: PayloadAction<string>): InventoriesState => {
      return { ...state, searchQuery: action.payload };
    },
    setInventorySearchPage: (state, action: PayloadAction<number>): InventoriesState => {
      return { ...state, page: action.payload };
    },
    setInventoryCount: (state, action: PayloadAction<number>): InventoriesState => {
      return { ...state, inventoriesCount: action.payload };
    },
  },
});

export const { inventoriesLoaded, setSearchQuery, setInventorySearchPage, setInventoryCount } =
inventoriesSlice.actions;

export const inventoriesReducer = inventoriesSlice.reducer;

export const initialInventoryState: InventoryState = {
  inventory: {} as Inventory,
  type:  {} as ResourceType,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState: initialInventoryState,
  reducers: {
    inventoryLoaded: (state, action: PayloadAction<Inventory>): InventoryState => {
      return { ...state, inventory: action.payload };
    },
    resourceTypeConfigurationLoaded: (state, action: PayloadAction<ResourceType>): InventoryState => {
      return { ...state, type: action.payload };
    },
  },
});

export const { inventoryLoaded, resourceTypeConfigurationLoaded } = inventorySlice.actions;
export const inventoryReducer = inventorySlice.reducer;

export default {
  inventories: inventoriesReducer,
  inventory: inventoryReducer,
};
