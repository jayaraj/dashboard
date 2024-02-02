import { ReactNode } from 'react';

import { UrlQueryMap } from '@grafana/data';
import { AlertingState } from 'app/types/devicemanagement/alert';

export const alertsPageLimit = 50;
export const ALERT_POLL_INTERVAL_MS = 60000;

export interface GrafoAlertsOptions {}

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
  renderExpandedContent?: () => ReactNode;
}

export interface DynamicTableProps<T = unknown> {
  cols: Array<DynamicTableColumnProps<T>>;
  items: Array<DynamicTableItemProps<T>>;

  isExpandable?: boolean;
  pagination: DynamicTablePagination;
  paginationStyles?: string;

  // provide these to manually control expanded status
  onCollapse?: (item: DynamicTableItemProps<T>) => void;
  onExpand?: (item: DynamicTableItemProps<T>) => void;
  isExpanded?: (item: DynamicTableItemProps<T>) => boolean;

  renderExpandedContent?: (
    item: DynamicTableItemProps<T>,
    index: number,
    items: Array<DynamicTableItemProps<T>>
  ) => ReactNode;
  testIdGenerator?: (item: DynamicTableItemProps<T>, index: number) => string;
  renderPrefixHeader?: () => ReactNode;
  renderPrefixCell?: (
    item: DynamicTableItemProps<T>,
    index: number,
    items: Array<DynamicTableItemProps<T>>
  ) => ReactNode;

  footerRow?: JSX.Element;
}

export const getFiltersFromUrl = (queryParams: UrlQueryMap): FilterState => {
  const name = queryParams['name'] === undefined ? undefined : String(queryParams['name']);
  const alertingState = queryParams['state'] === undefined ? undefined : String(queryParams['state']);
  const state = AlertingState[alertingState as keyof typeof AlertingState];
  return { name, state };
};
