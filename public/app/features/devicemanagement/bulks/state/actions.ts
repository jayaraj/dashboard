import { getBackendSrv } from '@grafana/runtime';
import { ThunkResult, csvErrorsPageLimit, csvEntriesPageLimit } from 'app/types';

import { 
  bulksLoaded,
  setBulksSearchPage,
  setBulksCount,
  bulkLoaded,
  setBulkErrorsSearchPage,
  setBulkErrorsCount,
  bulkErrorsLoaded
} from './reducers';

export function loadBulks(query: string, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/bulks/search', {
      query: query,
      page: page,
      perPage: csvEntriesPageLimit,
    });
    dispatch(bulksLoaded(response.csv_entries));
    dispatch(setBulksSearchPage(response.page));
    dispatch(setBulksCount(response.count));
  };
}

export function loadBulk(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/bulks/${id}`);
    dispatch(bulkLoaded(response));
    dispatch(loadBulkErrors(id, 1));
  };
}

export function deleteBulk(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/bulks/${id}`);
    dispatch(loadBulks('', 1));
  };
}

export function loadBulkErrors(id: number, page: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/bulks/${id}/errors`, {
      page: page,
      perPage: csvErrorsPageLimit,
    });
    dispatch(bulkErrorsLoaded(response.csv_errors));
    dispatch(setBulkErrorsSearchPage(response.page));
    dispatch(setBulkErrorsCount(response.count));
  };
}
