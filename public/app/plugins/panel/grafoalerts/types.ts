import { ReactNode } from 'react';

import { UrlQueryMap } from '@grafana/data';
import { AlertingState } from 'app/types/devicemanagement/alert';

export const alertsPageLimit = 15;

export interface GrafoAlertsOptions {
  history: boolean;
}

export interface FilterState {
  name?: string;
  state?: AlertingState;
}

export interface AssociatedReference {
  resource?: number;
  group?: string;
}

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
  onChange: (id: number) => void;
  selected: number;
}

export interface DynamicTableProps<T = unknown> {
  cols: Array<DynamicTableColumnProps<T>>;
  items: Array<DynamicTableItemProps<T>>;

  pagination: DynamicTablePagination;
  paginationStyles?: string;
}

export const getFiltersFromUrl = (queryParams: UrlQueryMap): FilterState => {
  const name = queryParams['name'] === undefined ? undefined : String(queryParams['name']);
  const alertingState = queryParams['state'] === undefined ? undefined : String(queryParams['state']);
  const state = AlertingState[alertingState as keyof typeof AlertingState];
  return { name, state };
};
