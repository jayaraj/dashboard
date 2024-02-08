import { ReactNode } from 'react';

export const alertsPageLimit = 15;
export interface GrafoAlertsHistoryOptions {}

export interface DynamicTablePagination {
  page: number;
  onPageChange: (page: number) => void;
  total: number;
  itemsPerPage: number;
}

export interface DynamicTableColumnProps<T = unknown> {
  id: string | number;
  label: string;
  renderCell: (item: DynamicTableItemProps<T>, index: number) => ReactNode;
  size?: number | string;
}

export interface DynamicTableItemProps<T = unknown> {
  id: string | number;
  data: T;
}

export interface DynamicTableProps<T = unknown> {
  cols: Array<DynamicTableColumnProps<T>>;
  items: Array<DynamicTableItemProps<T>>;
  pagination: DynamicTablePagination;
  paginationStyles?: string;
}
