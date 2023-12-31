export const csvErrorsPageLimit = 50;

export interface CsvError {
  id: number;
  updated_at: string;
  csv_entry_id: number;
  configuration: any;
  error: string;
}

export interface CsvErrorsState {
  csvErrors: CsvError[];
  csvErrorsCount: number;
  searchPage: number;
  hasFetched: boolean;
}