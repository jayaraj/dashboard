import { GroupType } from "./groupType";

export interface Group {
  id: number;
  name: string;
  path: string;
  type: string;
  level: number;
  parent: number;
  child: boolean;
  groups: Group[];
}

export interface GroupUser {
  id: number;
  login: string;
  email: string;
  name: string;
}

export interface GroupResource {
  id: number;
  resource_id: number;
  resource_uuid: string;
  resource_name: string;
  resource_type: string;
}

export interface GroupsState {
  groups: Group[];
  searchQuery: string;
  page: number;
  count: number;
  hasFetched: boolean;
}

export interface GroupState {
  group: Group;
  searchChildrenQuery: string;
  users: GroupUser[];
  userSearchQuery: string;
  usersCount: number;
  usersPage: number;
  resources: GroupResource[];
  resourceSearchQuery: string;
  resourcesCount: number;
  resourcesPage: number;
  hasFetched: boolean;
  data: any;
  type: GroupType;
}
