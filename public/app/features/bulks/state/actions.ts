import { getBackendSrv } from '@grafana/runtime';
import { ThunkResult } from 'app/types';

import { 
  bulksLoaded,
  setBulksSearchPage,
  setBulksCount,
  bulkLoaded,
  setBulkErrorsSearchPage,
  setBulkErrorsCount,
  bulkErrorsLoaded
} from './reducers';

export function loadBulks(query: string, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get('/api/bulks/search', {
      query: query,
      page: page,
      perPage: perPage,
    });
    dispatch(bulksLoaded(response.bulks));
    dispatch(setBulksSearchPage(response.page));
    dispatch(setBulksCount(response.count));
  };
}

export function loadBulk(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/bulks/${id}`);
    dispatch(bulkLoaded(response));
    dispatch(loadBulkErrors(id, 1, perPage));
  };
}

export function deleteBulk(id: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/bulks/${id}`);
    dispatch(loadBulks('', 1, perPage));
  };
}

export function loadBulkErrors(id: number, page: number, perPage: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/bulks/${id}/errors`, {
      page: page,
      perPage: perPage,
    });
    dispatch(bulkErrorsLoaded(response.bulk_errors));
    dispatch(setBulkErrorsSearchPage(response.page));
    dispatch(setBulkErrorsCount(response.count));
  };
}
