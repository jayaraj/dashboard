
import { SelectableValue } from '@grafana/data';

export const groupPageLimit = 50;

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

export interface CreateGroupDTO {
  name: string;
  type: string;
  parent: number;
}

export interface UpdateGroupDTO {
  name: string;
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