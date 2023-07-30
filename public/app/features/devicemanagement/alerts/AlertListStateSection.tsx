import { css } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { FC, useState, useCallback, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePrevious } from 'react-use';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, LoadingPlaceholder } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { ALERT_POLL_INTERVAL_MS, AlertingState, StoreState, alertPageLimit } from 'app/types';
import { AlertInstances } from './AlertInstances';
import { CollapseToggle } from './CollapseToggle';
import { loadAlertsByState } from './state/actions';
import { getAlertsByState, getAlertsByStateStats, getAlertsByStateLoaded, getAlertsByStateSearchPage } from './state/selectors';
import { DynamicTablePagination, getFiltersFromUrlParams, alertStateToReadable } from './utils';

interface Props {
  state: AlertingState;
  defaultCollapsed?: boolean;
}

export const AlertListStateSection: FC<Props> = ({ state, defaultCollapsed = false }) => {
  const dispatch = useDispatch();
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const styles = useStyles2(getStyles);
  const [queryParams] = useQueryParams();
  const { queryString, association } = getFiltersFromUrlParams(queryParams);
  const associationType = useRef<any>(null);
  const prevQueryString = usePrevious<any>(queryString);
  const alerts = useSelector((s: StoreState) => {return getAlertsByState(s.alerts, state);});
  const loading = useSelector((s: StoreState) => {return !getAlertsByStateLoaded(s.alerts, state);});
  const page = useSelector((s: StoreState) => {return getAlertsByStateSearchPage(s.alerts, state);});
  const stats = useSelector((s: StoreState) => {return getAlertsByStateStats(s.alerts, state);});
  const totalPages = Math.ceil(stats.count / alertPageLimit);
  const onEdit = useCallback(() => {
    dispatch(loadAlertsByState(state, page, associationType.current, queryString));
  },[dispatch]);
  const load = useCallback((newPage: number, queryString?: string ) => {
      dispatch(loadAlertsByState(state, newPage, associationType.current, queryString));
  },[dispatch]);
  const debouncedLoad = debouncePromise(load, 300, { leading: true });
  const pagination: DynamicTablePagination = {
    page: page,
    onPageChange: load,
    total: totalPages,
    itemsPerPage: alertPageLimit
  }
  const interval = useRef<any>(null)


  useEffect(() => {
    if (!collapsed && association) {
      associationType.current = association;
      if (prevQueryString !== queryString){
        debouncedLoad(page, queryString);
      } else {
        debouncedLoad(page);
        interval.current = setInterval(() => dispatch(loadAlertsByState(state, page, association, queryString)), ALERT_POLL_INTERVAL_MS);
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
        {alertStateToReadable(state)} {!collapsed && (<>({stats.count})</>)} 
      </h4>
      <div className={styles.sectionHeader}>
        {(loading && !collapsed) ? <LoadingPlaceholder className={styles.loader} text="Loading..." /> : <div />}
      </div>
      {!collapsed && <AlertInstances className={styles.rulesTable} alerts={alerts} showGuidelines={false} pagination={pagination} onEdit={onEdit}  />}
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
