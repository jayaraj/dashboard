import { getBackendSrv } from '@grafana/runtime';
import { QueryRange, ThunkResult } from 'app/types';

import {
  invoicesLoaded,
  setInvoicesPage,
  setInvoicesCount,
  invoiceLoaded,
} from '../../groups/state/reducers';

export function loadInvoices(query: string, page: number, perPage: number, range: QueryRange): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/invoices/search`, {
      page: page,
      perPage: perPage,
      from: range.from,
      to: range.to,
      query: query,
    });
    dispatch(invoicesLoaded(response.invoices));
    dispatch(setInvoicesPage(response.page));
    dispatch(setInvoicesCount(response.count));
  };
}

export function loadInvoice(invoiceId: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/invoices/${invoiceId}`);
    dispatch(invoiceLoaded(response));
  };
}
