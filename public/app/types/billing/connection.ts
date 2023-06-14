import { SelectableValue } from '@grafana/data';

export const connectionPageLimit = 50;
export const connectionStatusTypes: Array<SelectableValue<string>> = [
  {
    label: 'New Connection',
    value: 'new_connection',
    description: `New connection created`,
  },
  {
    label: 'Commissioned',
    value: 'commissioned',
    description: `Resources are installed and commissioned`,
  },
  {
    label: 'Disconnected',
    value: 'disconnected',
    description: `Resources are disconnected`,
  },
  {
    label: 'Dismantled',
    value: 'dismantled',
    description: `Resources are dismantled`,
  },
  {
    label: 'Reconnected',
    value: 'reconnected',
    description: `Resources are reconnected`,
  },
];

export interface Connection {
  id: number;
  updated_at: string;
  org_id: number;
  group_id: number;
  group_path_id: number;
  profile: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  connection_ext: number;
}

export interface CreateConnectionDTO {
  group_parent_id: number;
  profile: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface UpdateConnectionDTO {
  profile: string;
  status: string;
  name: string;
  phone: string;
  email: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
}

export interface ConnectionsState {
  connections: Connection[];
  connectionsCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface ConnectionState {
  connection: Connection;
}
