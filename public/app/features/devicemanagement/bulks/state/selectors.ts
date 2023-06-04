import { BulksState, BulkState, Bulk, BulkErrorsState } from 'app/types';

export const getBulksSearchQuery = (state: BulksState) => state.searchQuery;
export const getBulksSearchPage = (state: BulksState) => state.searchPage;
export const getBulksCount = (state: BulksState) => state.bulksCount;
export const getBulkErrorsSearchPage = (state: BulkErrorsState) => state.searchPage;
export const getBulkErrorsCount = (state: BulkErrorsState) => state.bulkErrorsCount;
export const getBulkErrors = (state: BulkErrorsState) => state.bulkErrors? state.bulkErrors: [];

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
