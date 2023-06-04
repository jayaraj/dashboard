import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Inventory, InventoriesState, InventoryState, InventoryConfigurationState, InventoryConfiguration } from 'app/types';

export const initialInventoriesState: InventoriesState = {
  inventories: [],
  inventoriesCount: 0,
  searchPage: 1,
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
    setInventoriesSearchQuery: (state, action: PayloadAction<string>): InventoriesState => {
      return { ...state, searchQuery: action.payload };
    },
    setInventoriesSearchPage: (state, action: PayloadAction<number>): InventoriesState => {
      return { ...state, searchPage: action.payload };
    },
    setInventoriesCount: (state, action: PayloadAction<number>): InventoriesState => {
      return { ...state, inventoriesCount: action.payload };
    },
  },
});
export const { inventoriesLoaded, setInventoriesSearchQuery, setInventoriesSearchPage, setInventoriesCount } =
inventoriesSlice.actions;
export const inventoriesReducer = inventoriesSlice.reducer;

export const initialInventoryState: InventoryState = {
  inventory: {} as Inventory,
};
const inventorySlice = createSlice({
  name: 'inventory',
  initialState: initialInventoryState,
  reducers: {
    inventoryLoaded: (state, action: PayloadAction<Inventory>): InventoryState => {
      return { ...state, inventory: action.payload };
    },
  },
});
export const { inventoryLoaded } = inventorySlice.actions;
export const inventoryReducer = inventorySlice.reducer;

export const initialInventoryConfigurationState: InventoryConfigurationState = {
  configuration: {} as InventoryConfiguration,
};
const inventoryConfigurationSlice = createSlice({
  name: 'inventoryConfiguration',
  initialState: initialInventoryConfigurationState,
  reducers: {
    inventoryConfigurationLoaded: (state, action: PayloadAction<InventoryConfiguration>): InventoryConfigurationState => {
      return { ...state, configuration: action.payload };
    },
  },
});
export const { inventoryConfigurationLoaded } = inventoryConfigurationSlice.actions;
export const inventoryConfigurationReducer = inventoryConfigurationSlice.reducer;

export default {
  inventories: inventoriesReducer,
  inventory: inventoryReducer,
  inventoryConfiguration: inventoryConfigurationReducer,
};
