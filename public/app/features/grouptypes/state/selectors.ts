import { GroupType, GroupTypesState, GroupTypeState, Slab, SlabState } from 'app/types';

export const getSearchQuery = (state: GroupTypesState) => state.searchQuery;
export const getGroupTypeSearchPage = (state: GroupTypesState) => state.searchPage;
export const getGroupTypesCount = (state: GroupTypesState) => state.groupTypesCount;

export const getGroupType = (state: GroupTypeState, currentGroupTypeId: any): GroupType | null => {
  if (state.groupType.id === parseInt(currentGroupTypeId, 10)) {
    return state.groupType;
  }
  return null;
};

export const getSlab = (state: SlabState, currentGroupType: any): Slab | null => {
  if (state.slab.type === currentGroupType) {
    return state.slab;
  }
  return null;
};

export const getGroupTypes = (state: GroupTypesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.groupTypes.filter((groupType) => {
    return regex.test(groupType.type);
  });
};
