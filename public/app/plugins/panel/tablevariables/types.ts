import { TableSortByFieldState } from '@grafana/ui/src/components/Table/types';

export interface TableVariablesOptions {
  search: string;
  page: string;
  perPage: string;
  perPageLimit: number;
  sort: string;
  desc: string;
  showHeaders: boolean;
  headers: Header[];
  sortBy?: TableSortByFieldState[];
}

export interface Header {
  id: string;
  title: string;
  width: number;
}

export const defaults: TableVariablesOptions = {
  search: 'search',
  page: 'page',
  perPage: 'perPage',
  perPageLimit: 20,
  sort: 'sort',
  desc: 'desc',
  showHeaders: false,
  headers: [],
  sortBy: []
};

export const HeaderDefault: Header = {
  id: '',
  title: '',
  width: -1
};
