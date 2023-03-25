import { FormElement, LayoutSection } from "app/core/components/CustomForm/types";

export interface GroupType {
  id: number;
  type: string;
  configuration: ResourceConfiguration;
}

export interface ResourceConfiguration {
  sections: LayoutSection[];
  elements: FormElement[];
}

export interface GroupTypesState {
  groupTypes: GroupType[];
  groupTypesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface GroupTypeState {
  groupType: GroupType;
}
