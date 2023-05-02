import { BulksState, BulkState, Bulk } from 'app/types';

export const getSearchQuery = (state: BulksState) => state.searchQuery;
export const getBulksSearchPage = (state: BulksState) => state.page;
export const getBulksCount = (state: BulksState) => state.bulksCount;
export const getBulkErrorsSearchPage = (state: BulkState) => state.page;
export const getBulkErrorsCount = (state: BulkState) => state.bulkErrorsCount;
export const getBulkErrors = (state: BulkState) => state.bulkErrors? state.bulkErrors: [];

export const getBulk = (state: BulkState, currentBulkId: any): Bulk | null => {
  if (state.bulk.id === parseInt(currentBulkId, 10)) {
    return state.bulk;
  }
  return null;
};

export const getBulks = (state: BulksState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.bulks.filter((bulk) => {
    return regex.test(bulk.filename);
  });
};
