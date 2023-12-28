import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { useEffect, useCallback, useRef } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { LoadingPlaceholder, Pagination, useStyles2 } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { StoreState, useSelector, useDispatch } from 'app/types';
import {
  ALERT_POLL_INTERVAL_MS,
  AlertDefinitionDTO,
  alertDefinitionsPageLimit,
} from 'app/types/devicemanagement/alert';

import { loadAlertDefinitions } from '../state/actions';
import { setAlertDefinitionsFetched } from '../state/reducers';
import {
  getAlertDefinitions,
  getAlertDefinitionsStats,
  getAlertDefinitionsLoaded,
  getAlertDefinitionsSearchPage,
} from '../state/selectors';

import { AlertDefinitionItem } from './AlertDefinitionItem';
import { getFiltersFromUrlParams, getPaginationStyles } from './utils';

interface Props {
  association: string;
  associationReference: number | string;
}

export const AlertDefinitionsView = ({ association, associationReference }: Props) => {
  const dispatch = useDispatch();
  const styles = useStyles2(getStyles);
  const [queryParams] = useQueryParams();
  const { queryString, alertState } = getFiltersFromUrlParams(queryParams);
  const alerts = useSelector((state: StoreState) => {
    return getAlertDefinitions(state.alertDefinitions);
  });
  const loading = useSelector((state: StoreState) => {
    return !getAlertDefinitionsLoaded(state.alertDefinitions);
  });
  const page = useSelector((state: StoreState) => {
    return getAlertDefinitionsSearchPage(state.alertDefinitions);
  });
  const stats = useSelector((state: StoreState) => {
    return getAlertDefinitionsStats(state.alertDefinitions);
  });
  const totalPages = Math.ceil(stats.count / alertDefinitionsPageLimit);
  const load = useCallback(
    (newPage: number, queryString?: string, alertState?: string) => {
      const dto: AlertDefinitionDTO = {
        state: alertState,
        page: newPage,
        association: association,
        associationReference: associationReference,
        query: queryString,
      };
      dispatch(loadAlertDefinitions(dto));
    },
    [dispatch]
  );
  const debouncedLoad = debouncePromise(load, 300, { leading: true });
  const interval = useRef<any>(null);

  useEffect(() => {
    if (association) {
      debouncedLoad(page, queryString, alertState);
      if (!interval.current) {
        dispatch(setAlertDefinitionsFetched(false));
        const dto: AlertDefinitionDTO = {
          state: alertState,
          page: page,
          association: association,
          associationReference: associationReference,
          query: queryString,
        };
        interval.current = setInterval(() => dispatch(loadAlertDefinitions(dto)), ALERT_POLL_INTERVAL_MS);
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
        <AlertDefinitionItem
          key={`${alert.name}`}
          alertDefinition={alert}
          association={association}
          associationReference={associationReference}
        />
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
