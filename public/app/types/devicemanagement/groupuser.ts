
export const groupUserPageLimit = 50;

export interface GroupUser {
  id: number;
  login: string;
  email: string;
  name: string;
  role: string;
}

export interface GroupUsersState {
  groupUsers: GroupUser[];
  searchQuery: string;
  searchPage: number;
  groupUsersCount: number;
  hasFetched: boolean;
}