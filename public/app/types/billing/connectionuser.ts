import { OrgRole } from '@grafana/data';

export const connectionUserPageLimit = 50;

export interface ConnectionUser {
  user_id: number;
  role: OrgRole;
  name: string;
  email: string;
  login: string;
}

export interface ConnectionUsersState {
  connectionUsers: ConnectionUser[];
  connectionUsersCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}
