import { getBackendSrv } from '@grafana/runtime';
import { ThunkResult, bulkErrorPageLimit, bulkPageLimit } from 'app/types';

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
      perPage: bulkPageLimit,
    });
    dispatch(bulksLoaded(response.bulks));
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
      perPage: bulkErrorPageLimit,
    });
    dispatch(bulkErrorsLoaded(response.bulk_errors));
    dispatch(setBulkErrorsSearchPage(response.page));
    dispatch(setBulkErrorsCount(response.count));
  };
}
