import { SelectableValue } from '@grafana/data';

export const groupsPageLimit = 50;

export interface Group {
  id: number;
  name: string;
  path: string;
  type: string;
  level: number;
  parent: number;
  child: boolean;
  tags: string;
  groups: Group[];
}

export interface CreateGroupDTO {
  name: string;
  type: string;
  parent: number;
  tags: string[];
}

export interface UpdateGroupDTO {
  name: string;
  tags: string[];
}

export interface GroupsState {
  groups: Group[];
  groupsCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface GroupState {
  group: Group;
}

export const groupToSelectableValue = (group: Group): SelectableValue<Group> => ({
  label: group.name,
  value: group,
});

export const groupsToSelectableValues = (arr: Group[] | undefined): Array<SelectableValue<Group>> =>
  (arr ?? []).map(groupToSelectableValue);
