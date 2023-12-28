import { debounce } from 'lodash';

import { getBackendSrv } from '@grafana/runtime';
import { ThunkResult } from 'app/types/';
import { csvEntriesPageLimit, csvErrorsPageLimit } from 'app/types/devicemanagement/fileloader';

import {
  csvEntriesLoaded,
  setCsvEntriesSearchPage,
  setCsvEntriesCount,
  csvErrorsLoaded,
  setCsvErrorsSearchPage,
  setCsvErrorsCount,
  setCsvEntriesSearchQuery,
  csvEntryLoaded,
} from './reducers';

export function loadCsvEntries(): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage, searchQuery } = getStore().csvEntries;
    const response = await getBackendSrv().get('/api/csventries/search', {
      query: searchQuery,
      page: searchPage,
      perPage: csvEntriesPageLimit,
    });
    dispatch(csvEntriesLoaded(response.csv_entries));
    dispatch(setCsvEntriesCount(response.count));
  };
}

const loadCsvEntriesWithDebounce = debounce((dispatch) => dispatch(loadCsvEntries()), 500);

export function changeCsvEntriesQuery(query: string): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setCsvEntriesSearchQuery(query));
    loadCsvEntriesWithDebounce(dispatch);
  };
}

export function changeCsvEntriesPage(page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setCsvEntriesSearchPage(page));
    dispatch(loadCsvEntries());
  };
}

export function loadCsvEntry(id: number): ThunkResult<void> {
  return async (dispatch) => {
    const response = await getBackendSrv().get(`/api/csventries/${id}`);
    dispatch(csvEntryLoaded(response));
    dispatch(loadCsvErrors(id));
  };
}

export function deleteCsvEntry(id: number): ThunkResult<void> {
  return async (dispatch) => {
    await getBackendSrv().delete(`/api/csventries/${id}`);
    dispatch(loadCsvEntries());
  };
}

export function loadCsvErrors(id: number): ThunkResult<void> {
  return async (dispatch, getStore) => {
    const { searchPage } = getStore().csvErrors;
    const response = await getBackendSrv().get(`/api/csventries/${id}/errors`, {
      page: searchPage,
      perPage: csvErrorsPageLimit,
    });
    dispatch(csvErrorsLoaded(response.csv_errors));
    dispatch(setCsvErrorsCount(response.count));
  };
}

export function changeCsvErrorsPage(id: number, page: number): ThunkResult<void> {
  return async (dispatch) => {
    dispatch(setCsvErrorsSearchPage(page));
    dispatch(loadCsvErrors(id));
  };
}
