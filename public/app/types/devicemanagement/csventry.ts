export const csvEntriesPageLimit = 50;
export interface CsvEntry {
  id: number;
  updated_at: string;
  filename: string;
  initiated: number;
  processed: number;
  errors: number;
}

export interface CsvEntriesState {
  csvEntries: CsvEntry[];
  csvEntriesCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface CsvEntryState {
  csvEntry: CsvEntry;
}
