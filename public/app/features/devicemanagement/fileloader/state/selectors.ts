import { CsvEntriesState, CsvEntry, CsvEntryState, CsvErrorsState } from 'app/types/devicemanagement/fileloader';

export const getCsvEntriesSearchQuery = (state: CsvEntriesState) => state.searchQuery;
export const getCsvEntriesSearchPage = (state: CsvEntriesState) => state.searchPage;
export const getCsvEntriesCount = (state: CsvEntriesState) => state.csvEntriesCount;
export const getCsvErrorsSearchPage = (state: CsvErrorsState) => state.searchPage;
export const getCsvErrorsCount = (state: CsvErrorsState) => state.csvErrorsCount;
export const getCsvErrors = (state: CsvErrorsState) => (state.csvErrors ? state.csvErrors : []);
export const getCsvEntries = (state: CsvEntriesState) => (state.csvEntries ? state.csvEntries : []);

export const getCsvEntry = (state: CsvEntryState, currentCsvEntryId: any): CsvEntry | null => {
  if (state.csvEntry.id === parseInt(currentCsvEntryId, 10)) {
    return state.csvEntry;
  }
  return null;
};
