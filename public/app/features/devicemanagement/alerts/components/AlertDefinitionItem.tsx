import { css, cx } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import { capitalize } from 'lodash';
import React, { FC, useState, useEffect, useCallback, useRef } from 'react';
import { usePrevious } from 'react-use';

import { GrafanaTheme2, IconName } from '@grafana/data';
import { Icon, useStyles2, LoadingPlaceholder } from '@grafana/ui';
import { OrgRolePicker } from 'app/features/admin/OrgRolePicker';
import { StoreState, useSelector, useDispatch } from 'app/types';
import {
  ALERT_POLL_INTERVAL_MS,
  Alert,
  AlertDefinition,
  AlertingState,
  alertsPageLimit,
  AlertsByNameDTO,
} from 'app/types/devicemanagement/alert';

import { loadAlertsByName } from '../state/actions';
import { setAlertsByNameFetched } from '../state/reducers';
import {
  getAlertsByName,
  getAlertsByNameStats,
  getAlertsByNameLoaded,
  getAlertsByNameSearchPage,
} from '../state/selectors';

import { ActionIcon } from './ActionIcon';
import { AlertInstanceStateFilter } from './AlertInstanceStateFilter';
import { AlertInstances } from './AlertInstances';
import AlertNotifications from './AlertNotifications';
import AlertSettings from './AlertSettings';
import { CollapseToggle } from './CollapseToggle';
import { MatcherFilter } from './MatcherFilter';
import { Stats } from './Stats';
import { DynamicTablePagination, useAlertsAccess } from './utils';

interface Props {
  alertDefinition: AlertDefinition;
  association: string;
  associationReference: number | string;
}

export const AlertDefinitionItem: FC<Props> = React.memo(({ alertDefinition, association, associationReference }) => {
  const dispatch = useDispatch();
  const styles = useStyles2(getStyles);
  const iconStyle = getIconStyle(alertDefinition.severity);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { canWriteAlertDefinitions, canWriteAlerts } = useAlertsAccess();
  let [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  let [isConfiguringNotification, setIsConfiguringNotification] = useState<boolean>(false);
  const url = `org/alertdefinitions/edit/${alertDefinition.id}`;
  const [filterKey] = useState<number>(Math.floor(Math.random() * 100));
  const queryStringKey = `queryString-${filterKey}`;
  const [queryString, setQueryString] = useState<string>();
  const [alertState, setAlertState] = useState<AlertingState>();
  const prevAlertState = usePrevious<any>(alertState);
  const prevQueryString = usePrevious<any>(queryString);
  const alerts = useSelector((state: StoreState) => {
    return getAlertsByName(state.alerts, alertDefinition.name);
  });
  const loading = useSelector((state: StoreState) => {
    return !getAlertsByNameLoaded(state.alerts, alertDefinition.name);
  });
  const page = useSelector((state: StoreState) => {
    return getAlertsByNameSearchPage(state.alerts, alertDefinition.name);
  });
  const stats = useSelector((state: StoreState) => {
    return getAlertsByNameStats(state.alerts, alertDefinition.name);
  });
  const onEdit = useCallback(() => {
    const dto: AlertsByNameDTO = {
      name: alertDefinition.name,
      page: page,
      association: association,
      associationReference: associationReference,
      state: alertState,
      query: queryString,
    };
    dispatch(loadAlertsByName(dto));
  }, [dispatch]);
  const alert: Alert = {
    id: 0,
    org_id: 0,
    resource_id: 0,
    group_path: '',
    state: '',
    message: '',
    updated_at: '',
    alert_definition_id: alertDefinition.id,
    name: alertDefinition.name,
    description: alertDefinition.description,
    associated_with: alertDefinition.associated_with,
    association_reference: associationReference,
    role: alertDefinition.role,
    severity: alertDefinition.severity,
    for: alertDefinition.for,
    ticket_enabled: alertDefinition.ticket_enabled,
    enabled: false,
    data: {},
    configuration: {},
    onEdit: () => {
      onEdit();
    },
    setConfiguringAlert: (alert: Alert) => {},
  };
  const load = useCallback(
    (newPage: number, alertState?: string, queryString?: string) => {
      const dto: AlertsByNameDTO = {
        name: alertDefinition.name,
        page: newPage,
        association: association,
        associationReference: associationReference,
        state: alertState,
        query: queryString,
      };
      dispatch(loadAlertsByName(dto));
    },
    [dispatch]
  );
  const debouncedLoad = debouncePromise(load, 300, { leading: true });
  const countAllByState = {
    [AlertingState.Alerting]: stats.alerting,
    [AlertingState.Pending]: stats.pending,
    [AlertingState.Normal]: stats.normal,
  } as const;
  const pagination: DynamicTablePagination = {
    page: page,
    onPageChange: load,
    total: stats.count,
    itemsPerPage: alertsPageLimit,
  };
  const interval = useRef<any>(null);
  const actionIcons: React.ReactNode[] = [];

  useEffect(() => {
    if (!isCollapsed && association) {
      if (prevAlertState !== alertState || prevQueryString !== queryString) {
        debouncedLoad(1, alertState, queryString);
      } else {
        dispatch(setAlertsByNameFetched({ name: alertDefinition.name, fetched: false }));
        debouncedLoad(page);
        const dto: AlertsByNameDTO = {
          name: alertDefinition.name,
          page: page,
          association: association,
          associationReference: associationReference,
          state: alertState,
          query: queryString,
        };
        interval.current = setInterval(() => dispatch(loadAlertsByName(dto)), ALERT_POLL_INTERVAL_MS);
      }
    } else {
      clearInterval(interval.current!);
      interval.current = null;
    }
    return () => {
      clearInterval(interval.current!);
    };
  }, [isCollapsed, dispatch, queryString, alertState, association]);

  if (canWriteAlertDefinitions && association === 'org') {
    actionIcons.push(
      <ActionIcon
        aria-label="edit alert definition"
        data-testid="edit-alertdefinition"
        key="edit"
        icon="sliders-v-alt"
        tooltip="edit alert definition"
        to={url}
      />
    );
  }
  if (canWriteAlerts) {
    actionIcons.push(
      <ActionIcon
        aria-label="configure alert"
        data-testid="configure-alert"
        key="configure"
        icon="pen"
        tooltip="configure alert"
        onClick={() => setIsConfiguring(true)}
      />
    );
  }
  actionIcons.push(
    <ActionIcon
      aria-label="configure notifications"
      data-testid="configure-notification"
      key="configure-notification"
      icon="comment-alt-share"
      tooltip="configure notifications"
      onClick={() => setIsConfiguringNotification(true)}
    />
  );

  const renderAlertInstances = () => {
    return (
      <>
        {loading ? (
          <LoadingPlaceholder className={styles.loader} text="Loading..." />
        ) : (
          <AlertInstances
            showGuidelines={true}
            className={styles.rulesTable}
            alerts={alerts}
            pagination={pagination}
            onEdit={onEdit}
            association={association}
            associationReference={associationReference}
          />
        )}
      </>
    );
  };

  return (
    <div className={styles.wrapper} data-testid="rule-group">
      <div className={styles.header} data-testid="rule-group-header">
        <div className={styles.row} data-testid="row">
          <div className={styles.cell} key={`toggle-${alertDefinition.id}`}>
            <CollapseToggle
              className={styles.collapseToggle}
              isCollapsed={isCollapsed}
              onToggle={setIsCollapsed}
              data-testid="group-collapse-toggle"
            />
          </div>
          <div className={styles.cell} key={`icon-${alertDefinition.id}`}>
            <Icon name={isCollapsed ? 'folder' : 'folder-open'} />
          </div>
          <div className={styles.cell} key={`name-${alertDefinition.id}`}>
            <h6 className={styles.heading}>{alertDefinition.name}</h6>
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`permission-${alertDefinition.id}`}>
            <OrgRolePicker aria-label="Role" value={alertDefinition.role} disabled={true} onChange={() => {}} />
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`description-${alertDefinition.id}`}>
            <span>{alertDefinition.description}</span>
          </div>
        </div>
        <div className={styles.spacer} />
        <div className={styles.headerStats}>
          <Stats
            stats={{
              count: alertDefinition.alerting + alertDefinition.pending + alertDefinition.normal,
              alerting: alertDefinition.alerting,
              pending: alertDefinition.pending,
              normal: alertDefinition.normal,
            }}
          />
        </div>
        {!!actionIcons.length && (
          <>
            <div className={styles.actionsSeparator}>|</div>
            <div className={cx(styles.actionIcons, iconStyle.icon)}>
              <Icon
                name={getIcon(alertDefinition.associated_with)}
                title={
                  capitalize(alertDefinition.associated_with) + ' level with severity: ' + alertDefinition.severity
                }
              />
            </div>
            {alertDefinition.ticket_enabled && (
              <div className={cx(styles.actionIcons, styles.iconColor)}>
                <Icon name={'ticket' as IconName} title={'Ticketable'} />
              </div>
            )}
            <div className={styles.actionIcons}>{actionIcons}</div>
          </>
        )}
      </div>
      {!isCollapsed && (
        <div className={styles.relative}>
          {alerts.length > 0 && <div className={cx(styles.headerGuideline, styles.guideline)} />}
          <div className={cx(styles.flexRow, styles.spaceBetween)}>
            <div className={styles.flexRow}>
              <div className={styles.spacer} />
              <MatcherFilter
                className={styles.rowChild}
                key={queryStringKey}
                defaultQueryString={queryString}
                onFilterChange={(value) => setQueryString(value)}
              />
              <AlertInstanceStateFilter
                className={styles.rowChild}
                stateFilter={alertState}
                onStateFilterChange={setAlertState}
                itemPerStateStats={countAllByState}
              />
            </div>
          </div>
        </div>
      )}
      {!isCollapsed && renderAlertInstances()}
      <AlertSettings
        isOpen={isConfiguring}
        onCancel={(open: boolean) => {
          setIsConfiguring(open);
        }}
        alert={alert}
        association={association}
        associationReference={associationReference}
      />
      <AlertNotifications
        isOpen={isConfiguringNotification}
        onCancel={(open: boolean) => {
          setIsConfiguringNotification(open);
        }}
        alertDefinition={alertDefinition}
      />
    </div>
  );
});

AlertDefinitionItem.displayName = 'AlertDefinitionItem';

export const getIcon = (association: string) => {
  switch (association) {
    case 'org': {
      return 'cog';
    }
    case 'group': {
      return 'layer-group';
    }
    case 'resource': {
      return 'resource';
    }
    default: {
      return 'question-circle';
    }
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': {
      return '#dc143c';
    }
    case 'major': {
      return '#ff8c00';
    }
    case 'minor': {
      return '#ffcc00';
    }
    default: {
      return '#9fa7b3';
    }
  }
};

export const getIconStyle = (severity: string) => ({
  icon: css`
    color: ${getSeverityColor(severity)};
    font-weight: 500;
  `,
});

export const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css`
    & + & {
      margin-top: ${theme.spacing(2)};
    }
  `,
  header: css`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: ${theme.spacing(1)} ${theme.spacing(1)} ${theme.spacing(1)} 0;
    background-color: ${theme.colors.background.secondary};
    flex-wrap: wrap;
  `,
  headerStats: css`
    span {
      vertical-align: middle;
    }

    ${theme.breakpoints.down('sm')} {
      order: 2;
      width: 100%;
      padding-left: ${theme.spacing(1)};
    }
  `,
  heading: css`
    margin-left: ${theme.spacing(1)};
    margin-bottom: 0;
  `,
  spacer: css`
    flex: 1;

    ${theme.breakpoints.down('sm')} {
      flex: 0;
    }
  `,
  collapseToggle: css`
    background: none;
    border: none;
    margin-top: -${theme.spacing(1)};
    margin-bottom: -${theme.spacing(1)};

    svg {
      margin-bottom: 0;
    }
  `,
  actionsSeparator: css`
    margin: 0 ${theme.spacing(2)};
  `,
  actionIcons: css`
    & > * + * {
      margin-left: ${theme.spacing(0.5)};
    }
  `,
  rulesTable: css`
    margin-top: ${theme.spacing(3)};
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
  rowChild: css`
    margin-right: ${theme.spacing(1)};
  `,
  loader: css`
    margin-bottom: 0;
  `,
  guideline: css`
    left: 18px;
    border-left: 1px solid ${theme.colors.border.medium};
    position: absolute;

    ${theme.breakpoints.down('md')} {
      display: none;
    }
  `,
  headerGuideline: css`
    top: 0px;
    bottom: 0;
  `,
  relative: css`
    padding-top: ${theme.spacing(1)};
    position: relative;
    height: 100%;
  `,
  row: css`
    display: grid;
    grid-template-columns: 40px 20px 150px 120px auto;
    grid-template-rows: 1fr auto;
    align-items: center;

    ${theme.breakpoints.down('sm')} {
      grid-template-columns: 40px 20px auto;
      padding: 0 ${theme.spacing(0.5)};
    }
  `,
  hide: css`
    ${theme.breakpoints.down('sm')} {
      display: none;
    }
  `,
  cell: css`
    align-items: center;
    padding: ${theme.spacing(1)};

    ${theme.breakpoints.down('sm')} {
      padding: ${theme.spacing(1)} 0;
      grid-template-columns: 1fr;
    }
  `,
  iconColor: css`
    color: #339900;
  `,
});
