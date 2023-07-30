import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { FC, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { GrafanaTheme2 } from '@grafana/data';
import { LoadingPlaceholder, Pagination, useStyles2 } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { ALERT_POLL_INTERVAL_MS,  StoreState, alertDefinitionPageLimit } from 'app/types';
import { AlertDefinitionItem } from './AlertDefinitionItem';
import { loadAlertDefinitions } from './state/actions';
import { getAlertDefinitions, getAlertDefinitionsStats, getAlertDefinitionsLoaded, getAlertDefinitionsSearchPage } from './state/selectors';
import { getFiltersFromUrlParams, getPaginationStyles } from './utils';
import { setAlertDefinitionsFetched } from './state/reducers';

interface Props {}

export const AlertDefinitionsView: FC<Props> = () => {
  const dispatch = useDispatch();
  const styles = useStyles2(getStyles);
  const [queryParams] = useQueryParams();
  const { queryString, alertState, association } = getFiltersFromUrlParams(queryParams);
  const associationType = useRef<any>(null);
  const alerts = useSelector((state: StoreState) => {return getAlertDefinitions(state.alertDefinitions);});
  const loading = useSelector((state: StoreState) => {return !getAlertDefinitionsLoaded(state.alertDefinitions);});
  const page = useSelector((state: StoreState) => {return getAlertDefinitionsSearchPage(state.alertDefinitions);});
  const stats = useSelector((state: StoreState) => {return getAlertDefinitionsStats(state.alertDefinitions);});
  const totalPages = Math.ceil(stats.count / alertDefinitionPageLimit);
  const load = useCallback((newPage: number, queryString?: string, alertState?: string) => {
    dispatch(loadAlertDefinitions(newPage, associationType.current, alertState, queryString));
    },[dispatch]);
  const debouncedLoad = debouncePromise(load, 300, { leading: true });
  const interval = useRef<any>(null)

  useEffect(() => {
    if (association) {
      associationType.current = association;
      debouncedLoad(page, queryString, alertState);
      if (!interval.current) {
        dispatch(setAlertDefinitionsFetched(false));
        interval.current = setInterval(() => dispatch(loadAlertDefinitions(page, association, alertState, queryString)), ALERT_POLL_INTERVAL_MS);
      } 
    }
    return () => {
      clearInterval(interval.current);
      interval.current = null;
    };
  }, [dispatch, queryString, alertState, association]);


  return (
    <section className={styles.wrapper}>
      <div className={styles.sectionHeader}>
        {loading ? <LoadingPlaceholder className={styles.loader} text="Loading..." /> : <div />}
      </div>

      {alerts.map((alert) => (
        <AlertDefinitionItem key={`${alert.name}`} alertDefinition={alert}/>
      ))}
      <Pagination
        className={styles.pagination}
        currentPage={page}
        numberOfPages={totalPages}
        onNavigate={load}
        hideWhenSinglePage
      />
    </section>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  loader: css`
    margin-bottom: 0;
  `,
  sectionHeader: css`
    display: flex;
    justify-content: space-between;
  `,
  wrapper: css`
    margin-bottom: ${theme.spacing(4)};
  `,
  pagination: getPaginationStyles(theme),
});
