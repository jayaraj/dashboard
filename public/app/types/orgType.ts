import { ResourceConfiguration } from "./groupType";

export interface OrgType {
  id: number;
  type: string;
  configuration: ResourceConfiguration;
}

export interface OrgTypesState {
  orgTypes: OrgType[];
  orgTypesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface OrgTypeState {
  orgType: OrgType;
  data: any;
}
