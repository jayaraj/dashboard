
export interface InventoryConfiguration {
  id: number;
  inventory_id: number;
  type: string;
  configuration: any;
}

export interface InventoryConfigurationState {
  configuration: InventoryConfiguration;
}