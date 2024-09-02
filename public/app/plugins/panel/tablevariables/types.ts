export interface TableVariablesOptions {
  search: string;
  page: string;
  perPage: string;
  perPageLimit: number;
  sort: string;
  desc: string;
  showHeaders: boolean;
  headers: Header[];
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
  headers: []
};

export const HeaderDefault: Header = {
  id: '',
  title: '',
  width: -1
};
