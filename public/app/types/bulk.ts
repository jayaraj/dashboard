export interface Bulk {
  id: number;
  updated_at: string;
  filename: string;
  initiated: number;
  processed: number;
  errors: number;
}

export interface BulkError {
  id: number;
  updated_at: string;
  bulk_id: number;
  configuration: any;
  error: string;
}

export interface BulksState {
  bulks: Bulk[];
  bulksCount: number;
  searchQuery: string;
  page: number;
  hasFetched: boolean;
}

export interface BulkState {
  bulk: Bulk;
  bulkErrors: BulkError[];
  bulkErrorsCount: number;
  page: number;
  hasFetched: boolean;
}
