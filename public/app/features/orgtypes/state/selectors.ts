import { OrgType, OrgTypesState, OrgTypeState} from 'app/types';

export const getSearchQuery = (state: OrgTypesState) => state.searchQuery;
export const getOrgTypeSearchPage = (state: OrgTypesState) => state.searchPage;
export const getOrgTypesCount = (state: OrgTypesState) => state.orgTypesCount;
export const getOrgConfiguration = (state: OrgTypeState) => state.data;

export const getOrgType = (state: OrgTypeState, currentOrgTypeId: any): OrgType | null => {
  if (state.orgType.id === parseInt(currentOrgTypeId, 10)) {
    return state.orgType;
  }
  return null;
};

export const getOrgTypes = (state: OrgTypesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.orgTypes.filter((orgType) => {
    return regex.test(orgType.type);
  });
};
