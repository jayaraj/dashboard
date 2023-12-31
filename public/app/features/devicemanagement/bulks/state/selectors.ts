import { CsvEntriesState, CsvEntryState, CsvEntry, CsvErrorsState } from 'app/types';

export const getBulksSearchQuery = (state: CsvEntriesState) => state.searchQuery;
export const getBulksSearchPage = (state: CsvEntriesState) => state.searchPage;
export const getBulksCount = (state: CsvEntriesState) => state.csvEntriesCount;
export const getBulkErrorsSearchPage = (state: CsvErrorsState) => state.searchPage;
export const getBulkErrorsCount = (state: CsvErrorsState) => state.csvErrorsCount;
export const getBulkErrors = (state: CsvErrorsState) => state.csvErrors? state.csvErrors: [];

export const getBulk = (state: CsvEntryState, currentBulkId: any): CsvEntry | null => {
  if (state.csvEntry.id === parseInt(currentBulkId, 10)) {
    return state.csvEntry;
  }
  return null;
};

export const getBulks = (state: CsvEntriesState) => {
  const regex = RegExp(state.searchQuery, 'i');

  return state.csvEntries.filter((bulk) => {
    return regex.test(bulk.filename);
  });
};
