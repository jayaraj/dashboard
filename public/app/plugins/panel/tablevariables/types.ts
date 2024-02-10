export interface TableVariablesOptions {
  search: string;
  page: string;
  perPage: string;
  perPageLimit: number;
}

export const defaults: TableVariablesOptions = {
  search: 'search',
  page: 'page',
  perPage: 'perPage',
  perPageLimit: 20,
};
