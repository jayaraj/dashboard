
export const bulkErrorPageLimit = 50;

export interface BulkError {
  id: number;
  updated_at: string;
  bulk_id: number;
  configuration: any;
  error: string;
}

export interface BulkErrorsState {
  bulkErrors: BulkError[];
  bulkErrorsCount: number;
  searchPage: number;
  hasFetched: boolean;
}