import { OrgRole } from '@grafana/data';

export const connectionUsersPageLimit = 50;

export interface ConnectionUser {
  id: number;
  user_id: number;
  role: OrgRole;
  name: string;
  email: string;
  phone: string;
  login: string;
}

export interface ConnectionUsersState {
  connectionUsers: ConnectionUser[];
  connectionUsersCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}
