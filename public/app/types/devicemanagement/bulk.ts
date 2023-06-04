
export const bulkPageLimit = 50;
export interface Bulk {
  id: number;
  updated_at: string;
  filename: string;
  initiated: number;
  processed: number;
  errors: number;
}

export interface BulksState {
  bulks: Bulk[];
  bulksCount: number;
  searchQuery: string;
  searchPage: number;
  hasFetched: boolean;
}

export interface BulkState {
  bulk: Bulk;
}
