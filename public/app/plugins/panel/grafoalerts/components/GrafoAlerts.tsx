import { css, cx } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import { debounce } from 'lodash';
import React, { useEffect, useState, useCallback } from 'react';

import { PanelProps, SelectableValue, GrafanaTheme2 } from '@grafana/data';
import { locationService } from '@grafana/runtime';
import { useStyles2, CustomScrollbar, LoadingPlaceholder, AsyncSelect, CallToActionCard } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';
import { getBackendSrv } from 'app/core/services/backend_srv';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { Alert, AlertDefinition, AlertingState } from 'app/types/devicemanagement/alert';

import { DynamicTablePagination, GrafoAlertsOptions, alertsPageLimit, getFiltersFromUrl } from '../types';

import { AlertInstances } from './AlertInstances';
import { MatcherFilter } from './MatcherFilter';
import { StateFilter } from './StateFilter';

interface Props extends PanelProps<GrafoAlertsOptions> {}

export const GrafoAlerts: React.FC<Props> = ({ replaceVariables, options }) => {
  const styles = useStyles2(getStyles);
  const [loading, setLoading] = useState(true);
  let resource: string | undefined = replaceVariables('${resource}');
  resource = resource === '${resource}' ? undefined : resource;
  let group: string | undefined = replaceVariables('${grouppath}');
  group = group === '${grouppath}' ? undefined : group;
  let alertVar: string | undefined = replaceVariables('${alert}');
  alertVar = alertVar === '${alert}' ? undefined : alertVar;
  const [queryParams] = useQueryParams();
  const { name, state } = getFiltersFromUrl(queryParams);
  const [alertName, setAlertName] = useState<SelectableValue<string>>();
  const [searchQuery, setSearchQuery] = useState('');
  const [alertState, setAlertState] = useState<AlertingState>();
  const [alertCounts, setAlertCounts] = useState<Record<string, number>>();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [page, setPage] = useState<number>(1);
  const dashboard = getDashboardSrv().getCurrent();
  const updateLocation = debounce((query) => locationService.partial(query, true), 10);
  const [selectedAlert, setSelectedAlert] = useState<number>(0);
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
    const query = { [`var-alert`]: undefined };
    updateLocation(query);
    const association: string = resource !== undefined ? 'resource' : group !== undefined ? 'group' : 'org';
    const associationRef: number | string = resource !== undefined ? resource : group !== undefined ? group : 0;

    let args: any = { query: searchQuery, page: page, perPage: alertsPageLimit, [association]: associationRef };
    if (alertState !== AlertingState.Unknown) {
      args.state = alertState;
    }
    if (alertName) {
      args.name = alertName.value;
    }

    const response = await getBackendSrv().get(`/api/grafoalerts/search`, args);
    const counts: Record<string, number> = {
      [AlertingState.Alerting]: response.alerting,
      [AlertingState.Pending]: response.pending,
      [AlertingState.Normal]: response.normal,
    };

    setAlerts(response.alerts);
    setAlertCounts(counts);
    setPagination({ ...pagination, page: response.page, total: response.count });
    setLoading(false);
  }, [page, alertState, alertName, searchQuery, alertsPageLimit, resource, group]);
  const debouncedLoadAlerts = debounce(() => loadAlerts(), 500);
  const refresh = debounce(() => dashboard?.startRefresh(), 1000);
  const onSelected = useCallback(
    (value: number) => {
      let query: { [`var-alert`]: number | undefined } = { [`var-alert`]: undefined };
      if (value > 0 && value !== selectedAlert) {
        query = { [`var-alert`]: value };
      }
      updateLocation(query);
    },
    [selectedAlert]
  );

  const loadOptions = useCallback(async (query?: string) => {
    const association: string = resource !== undefined ? 'resource' : group !== undefined ? 'group' : 'org';
    const associationRef: number | string = resource !== undefined ? resource : group !== undefined ? group : 0;
    let args: any = {
      query: query,
      page: 1,
      perPage: 1000,
      [association]: associationRef,
    };
    const response = await getBackendSrv().get('/api/alertdefinitions/search', args);
    const options = response.alert_definitions.map((ad: AlertDefinition) => ({ value: ad.name, label: ad.name }));
    if (options.length > 0) {
      if (name === undefined) {
        setAlertName(options[0]);
      }
    }
    return options;
  }, []);
  const debouncedLoadOptions = debouncePromise(loadOptions, 300, { leading: true });

  useEffect(() => {
    loadOptions();
  }, []);

  useEffect(() => {
    if (state !== undefined) {
      setPage(1);
      setAlertState(state);
    }
    if (name !== undefined) {
      setPage(1);
      setAlertName({ value: name, label: name });
    }
    if (alertVar !== undefined) {
      setSelectedAlert(Number(alertVar));
    }
  }, [name, state, alertVar]);

  useEffect(() => {
    if (alertName) {
      debouncedLoadAlerts();
      refresh();
    }
  }, [alertName, alertState, page, searchQuery]);

  return (
    <CustomScrollbar autoHeightMax="100%" autoHeightMin="100%">
      <section className={styles.container}>
        <div className={cx(styles.flexRow, styles.spaceBetween)}>
          <div className={styles.flexRow}>
            <AsyncSelect
              loadingMessage="Loading ..."
              width={25}
              cacheOptions={false}
              value={alertName}
              defaultOptions={true}
              loadOptions={(query: string) => debouncedLoadOptions(query)}
              onChange={(value: SelectableValue<string>) => {
                setPage(1);
                setAlertName(value);
              }}
              placeholder="Start typing to search"
              noOptionsMessage="No alerts found"
              aria-label="Alert picker"
            />
            <div className={styles.spacer} />
            <MatcherFilter
              className={styles.rowChild}
              defaultQueryString={searchQuery}
              onFilterChange={(value) => {
                setPage(1);
                setSearchQuery(value);
              }}
            />
            <StateFilter
              className={styles.rowChild}
              stateFilter={alertState}
              onStateFilterChange={(state) => {
                setPage(1);
                setAlertState(state);
              }}
              itemPerStateStats={alertCounts}
            />
          </div>
        </div>
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
            <AlertInstances
              className={styles.rulesTable}
              alerts={alerts}
              history={options.history}
              onSelected={onSelected}
              selected={selectedAlert}
              pagination={pagination}
            />
          </div>
        )}
      </section>
    </CustomScrollbar>
  );
};

export const getStyles = (theme: GrafanaTheme2) => {
  return {
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
