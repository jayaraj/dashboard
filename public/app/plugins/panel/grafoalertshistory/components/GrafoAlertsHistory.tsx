import { css, cx } from '@emotion/css';
import { debounce } from 'lodash';
import React, { useEffect, useState, useCallback } from 'react';

import { PanelProps, GrafanaTheme2 } from '@grafana/data';
import { useStyles2, CustomScrollbar, LoadingPlaceholder, CallToActionCard, InlineLabel, Stack } from '@grafana/ui';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { AlertHistory } from 'app/types/devicemanagement/alert';

import { DynamicTablePagination, GrafoAlertsHistoryOptions, alertsPageLimit } from '../types';

import { AlertInstances } from './AlertInstances';
import { AlertLabels } from './AlertLabels';

interface Props extends PanelProps<GrafoAlertsHistoryOptions> {}

export const GrafoAlertsHistory: React.FC<Props> = ({ replaceVariables }) => {
  const styles = useStyles2(getStyles);
  const [loading, setLoading] = useState(true);
  let alertVar: string | undefined = replaceVariables('${alert}');
  alertVar = alertVar === '${alert}' ? undefined : alertVar;
  const [alerts, setAlerts] = useState<AlertHistory[]>([]);
  const [page, setPage] = useState<number>(1);
  const [context, setContext] = useState<any>({});
  const [pagination, setPagination] = useState<DynamicTablePagination>({
    page: 1,
    onPageChange: (page: number) => {
      setPage(page);
    },
    total: 0,
    itemsPerPage: alertsPageLimit,
  });
  const loadAlerts = useCallback(async () => {
    setLoading(true);
    const alertId: number = alertVar !== undefined ? Number(alertVar) : 0;
    const args: any = { page: page, perPage: alertsPageLimit };
    const response = await getBackendSrv().get(`/api/grafoalerts/${alertId}/history`, args);
    const sortedAlerts = response.alerts.sort(
      (a: AlertHistory, b: AlertHistory) => new Date(b.time!).getTime() - new Date(a.time!).getTime()
    );
    setContext(response.context);
    setAlerts(sortedAlerts);
    setPagination({ ...pagination, page: response.page, total: response.count });
    setLoading(false);
  }, [page, alertsPageLimit, alertVar]);
  const refresh = debounce(() => loadAlerts(), 100);

  useEffect(() => {
    setAlerts([]);
    setContext({});
    if (alertVar !== undefined && alertVar !== '0') {
      refresh();
    } else {
      setLoading(false);
    }
  }, [alertVar, page]);

  return (
    <CustomScrollbar autoHeightMax="100%" autoHeightMin="100%">
      <section className={styles.container}>
        <section className={styles.stack}>
          <Stack gap={2} alignItems={'center'} wrap="wrap">
            <InlineLabel width="auto">Instance of</InlineLabel>
            <AlertLabels className={styles.start} labels={context} />
          </Stack>
        </section>
        {loading ? (
          <div className={styles.loaderWrapper}>
            <LoadingPlaceholder className={styles.loader} text="Loading..." />
          </div>
        ) : !alerts.length ? (
          <div className={cx(styles.wrapper, styles.emptyMessage)}>
            <CallToActionCard callToActionElement={<div />} message={`No alerts found.`} />
          </div>
        ) : (
          <div className={styles.wrapper} data-testid="rules-table">
            <AlertInstances className={styles.rulesTable} alerts={alerts} pagination={pagination} />
          </div>
        )}
      </section>
    </CustomScrollbar>
  );
};

export const getStyles = (theme: GrafanaTheme2) => {
  return {
    start: css`
      justify-content: flex-start;
      display: flex;
    `,
    flexRow: css`
      display: flex;
      flex-direction: row;
      align-items: flex-end;
      width: 100%;
      flex-wrap: wrap;
    `,
    spaceBetween: css`
      justify-content: space-between;
    `,
    spacer: css`
      flex: 1;

      ${theme.breakpoints.down('sm')} {
        flex: 0;
      }
    `,
    rowChild: css`
      margin-right: ${theme.spacing(1)};
    `,
    loader: css`
      margin-bottom: 0;
    `,
    container: css`
      margin: 10px;
    `,
    stack: css`
      padding-top: ${theme.spacing(2.5)};
    `,
    wrapper: css`
      width: auto;
      border-radius: ${theme.shape.borderRadius()};
    `,
    emptyMessage: css`
      padding-top: ${theme.spacing(2.5)};
    `,
    pagination: css`
      display: flex;
      margin: 0;
      padding-top: ${theme.spacing(1)};
      padding-bottom: ${theme.spacing(0.25)};
      justify-content: center;
      border-left: 1px solid ${theme.colors.border.strong};
      border-right: 1px solid ${theme.colors.border.strong};
      border-bottom: 1px solid ${theme.colors.border.strong};
    `,
    rulesTable: css`
      margin-top: ${theme.spacing(3)};
    `,
    loaderWrapper: css`
      display: flex;
      justify-content: center;
    `,
  };
};
