import { css } from '@emotion/css';
import { capitalize } from 'lodash';
import { useMemo, ReactNode } from 'react';

import { UrlQueryMap, GrafanaTheme2 } from '@grafana/data';
import { contextSrv } from 'app/core/services/context_srv';
import { AlertingState, FilterState } from 'app/types/devicemanagement/alert';

export function alertStateToReadable(state: AlertingState): string {
  if (state === AlertingState.Normal) {
    return 'Normal';
  }
  return capitalize(state);
}

export const getFiltersFromUrlParams = (queryParams: UrlQueryMap): FilterState => {
  const queryString = queryParams['queryString'] === undefined ? undefined : String(queryParams['queryString']);
  const alertState = queryParams['alertState'] === undefined ? undefined : String(queryParams['alertState']);
  const association = queryParams['association'] === undefined ? undefined : String(queryParams['association']);
  return { queryString, alertState, association };
};

export const getPaginationStyles = (theme: GrafanaTheme2) => {
  return css`
    float: none;
    display: flex;
    justify-content: flex-start;
    margin: ${theme.spacing(2, 0)};
  `;
};

export function useAlertsAccess() {
  return useMemo(() => getAlertsAccess(), []);
}

export function getAlertsAccess() {
  return {
    canWriteAlertDefinitions: contextSrv.hasPermission('alerts.definition:write'),
    canWriteAlerts: contextSrv.hasPermission('alerts:write'),
  };
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
