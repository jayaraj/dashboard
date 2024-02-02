import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { usePrevious } from 'react-use';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, LoadingPlaceholder } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { StoreState, useSelector, useDispatch } from 'app/types';
import {
  ALERT_POLL_INTERVAL_MS,
  AlertingState,
  AlertsByStateDTO,
  alertsPageLimit,
} from 'app/types/devicemanagement/alert';

import { loadAlertsByState } from '../state/actions';
import {
  getAlertsByState,
  getAlertsByStateStats,
  getAlertsByStateLoaded,
  getAlertsByStateSearchPage,
} from '../state/selectors';

import { AlertInstances } from './AlertInstances';
import { CollapseToggle } from './CollapseToggle';
import { DynamicTablePagination, getFiltersFromUrlParams, alertStateToReadable } from './utils';

interface Props {
  state: AlertingState;
  defaultCollapsed?: boolean;
  association: string;
  associationReference: number | string;
}

export const AlertListStateSection = ({
  state,
  defaultCollapsed = false,
  association,
  associationReference,
}: Props) => {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const styles = useStyles2(getStyles);
  const [queryParams] = useQueryParams();
  const { queryString } = getFiltersFromUrlParams(queryParams);
  const prevQueryString = usePrevious<any>(queryString);
  const alerts = useSelector((s: StoreState) => {
    return getAlertsByState(s.alerts, state);
  });
  const loading = useSelector((s: StoreState) => {
    return !getAlertsByStateLoaded(s.alerts, state);
  });
  const page = useSelector((s: StoreState) => {
    return getAlertsByStateSearchPage(s.alerts, state);
  });
  const stats = useSelector((s: StoreState) => {
    return getAlertsByStateStats(s.alerts, state);
  });
  const onEdit = useCallback(() => {
    const dto: AlertsByStateDTO = {
      state: state,
      page: page,
      association: association,
      associationReference: associationReference,
      query: queryString,
    };
    dispatch(loadAlertsByState(dto));
  }, [dispatch]);
  const load = useCallback(
    (newPage: number, queryString?: string) => {
      const dto: AlertsByStateDTO = {
        state: state,
        page: newPage,
        association: association,
        associationReference: associationReference,
        query: queryString,
      };
      dispatch(loadAlertsByState(dto));
    },
    [dispatch]
  );
  const debouncedLoad = debouncePromise(load, 300, { leading: true });
  const pagination: DynamicTablePagination = {
    page: page,
    onPageChange: load,
    total: stats.count,
    itemsPerPage: alertsPageLimit,
  };
  const interval = useRef<any>(null);

  useEffect(() => {
    if (!collapsed && association) {
      if (prevQueryString !== queryString) {
        debouncedLoad(1, queryString);
      } else {
        debouncedLoad(1);
        const dto: AlertsByStateDTO = {
          state: state,
          page: 1,
          association: association,
          associationReference: associationReference,
          query: queryString,
        };
        interval.current = setInterval(() => dispatch(loadAlertsByState(dto)), ALERT_POLL_INTERVAL_MS);
      }
    } else {
      clearInterval(interval.current!);
      interval.current = null;
    }
    return () => {
      clearInterval(interval.current!);
    };
  }, [collapsed, dispatch, queryString, association]);

  return (
    <>
      <h4 className={styles.header}>
        <CollapseToggle
          className={styles.collapseToggle}
          size="xxl"
          isCollapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
        {alertStateToReadable(state)} {!collapsed && <>({stats.count})</>}
      </h4>
      <div className={styles.sectionHeader}>
        {loading && !collapsed ? <LoadingPlaceholder className={styles.loader} text="Loading..." /> : <div />}
      </div>
      {!collapsed && (
        <AlertInstances
          className={styles.rulesTable}
          alerts={alerts}
          showGuidelines={false}
          pagination={pagination}
          onEdit={onEdit}
          association={association}
          associationReference={associationReference}
        />
      )}
    </>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  collapseToggle: css`
    vertical-align: middle;
  `,
  header: css`
    margin-top: ${theme.spacing(2)};
  `,
  rulesTable: css`
    margin-top: ${theme.spacing(3)};
  `,
  loader: css`
    margin-bottom: 0;
  `,
  sectionHeader: css`
    display: flex;
    justify-content: space-between;
  `,
});
