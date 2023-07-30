import { css, cx } from '@emotion/css';
import debouncePromise from 'debounce-promise';
import React, { FC, useState, useEffect, useCallback, useRef  } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { usePrevious } from 'react-use';

import { GrafanaTheme2 } from '@grafana/data';
import { Icon, useStyles2, LoadingPlaceholder, Select, Checkbox } from '@grafana/ui';
import { useQueryParams } from 'app/core/hooks/useQueryParams';

import { OrgRolePicker } from 'app/features/admin/OrgRolePicker';
import { ALERT_POLL_INTERVAL_MS, Alert, AlertDefinition, AlertingState, StoreState, alertPageLimit, associationTypes, severityTypes } from 'app/types';
import { ActionIcon } from './ActionIcon';
import { AlertInstanceStateFilter } from './AlertInstanceStateFilter';
import { AlertInstances } from './AlertInstances';
import AlertSettings from './AlertSettings';
import { CollapseToggle } from './CollapseToggle';
import { MatcherFilter } from './MatcherFilter';
import { Stats } from './Stats';
import { loadAlertsByName } from './state/actions';
import { getAlertsByName, getAlertsByNameStats, getAlertsByNameLoaded, getAlertsByNameSearchPage } from './state/selectors';
import { DynamicTablePagination, getFiltersFromUrlParams, useAlertsAccess } from './utils';
import { setAlertsByNameFetched } from './state/reducers';

interface Props {
  alertDefinition: AlertDefinition;
}

export const AlertDefinitionItem: FC<Props> = React.memo(({ alertDefinition }) => {
  const dispatch = useDispatch();
  const styles = useStyles2(getStyles);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [queryParams] = useQueryParams();
  const { association } = getFiltersFromUrlParams(queryParams);
  const associationType = useRef<any>(null);
  const { canWriteAlertDefinitions, canWriteAlerts } = useAlertsAccess();
  let [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const url = `org/alertdefinitions/edit/${alertDefinition.id}`;
  const [filterKey] = useState<number>(Math.floor(Math.random() * 100));
  const queryStringKey = `queryString-${filterKey}`;
  const [queryString, setQueryString] = useState<string>();
  const [alertState, setAlertState] = useState<AlertingState>();
  const prevAlertState = usePrevious<any>(alertState);
  const prevQueryString = usePrevious<any>(queryString);
  const alerts = useSelector((state: StoreState) => {return getAlertsByName(state.alerts, alertDefinition.name);});
  const loading = useSelector((state: StoreState) => {return !getAlertsByNameLoaded(state.alerts, alertDefinition.name);});
  const page = useSelector((state: StoreState) => {return getAlertsByNameSearchPage(state.alerts, alertDefinition.name);});
  const stats = useSelector((state: StoreState) => {return getAlertsByNameStats(state.alerts, alertDefinition.name);});
  const totalPages = Math.ceil(stats.count / alertPageLimit);
  const onEdit = useCallback(() => {
    dispatch(loadAlertsByName(alertDefinition.name, page, associationType.current, alertState, queryString));
  },[dispatch]);
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
    role: alertDefinition.role,
    severity: alertDefinition.severity,
    for: alertDefinition.for,
    ticket_enabled: alertDefinition.ticket_enabled,
    enabled: false,
    data: {},
    configuration: {},
    onEdit: () => {onEdit();}
  }
  const load = useCallback((newPage: number, alertState?: string, queryString?: string ) => {
    dispatch(loadAlertsByName(alertDefinition.name, newPage, associationType.current, alertState, queryString));
  },[dispatch]);
  const debouncedLoad = debouncePromise(load, 300, { leading: true });
  const countAllByState = {
    [AlertingState.Alerting]: stats.alerting,
    [AlertingState.Pending]: stats.pending,
    [AlertingState.Normal]: stats.normal,
  } as const;
  const pagination: DynamicTablePagination = {
    page: page,
    onPageChange: load,
    total: totalPages,
    itemsPerPage: alertPageLimit
  }
  const interval = useRef<any>(null)

  useEffect(() => {
      if (!isCollapsed && association) {
        associationType.current = association;
        if ((prevAlertState !== alertState) || (prevQueryString !== queryString)){
          debouncedLoad(page, alertState, queryString);
        } else {
          dispatch(setAlertsByNameFetched({name: alertDefinition.name, fetched: false}));
          debouncedLoad(page);
          interval.current = setInterval(() => dispatch(loadAlertsByName(alertDefinition.name, page, association, alertState, queryString)), ALERT_POLL_INTERVAL_MS);
        }
      } else {
        clearInterval(interval.current!);
        interval.current = null;
      }
      return () => {
        clearInterval(interval.current!);
      };
  }, [isCollapsed, dispatch, queryString, alertState, association]);

  const actionIcons: React.ReactNode[] = [];
  if (canWriteAlertDefinitions) {
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

  const renderAlertInstances =() => {
    return(
      <>
        {loading ? <LoadingPlaceholder className={styles.loader} text="Loading..." /> : <AlertInstances  showGuidelines={true} className={styles.rulesTable} alerts={alerts} pagination={pagination} onEdit={onEdit} />}
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
            <h6 className={styles.heading}>
              {alertDefinition.name}
            </h6>
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`description-${alertDefinition.id}`}>
            <span>{alertDefinition.description}</span>
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`association-${alertDefinition.id}`}>
            <Select  value={alertDefinition.associated_with} options={associationTypes} disabled={true}  onChange={()=>{}}/>
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`permission-${alertDefinition.id}`}>
            <OrgRolePicker aria-label="Role" value={alertDefinition.role} disabled={true}  onChange={()=>{}}/>
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`severity-${alertDefinition.id}`}>
            <Select  value={alertDefinition.severity} options={severityTypes} disabled={true}  onChange={()=>{}}/>
          </div>
          <div className={cx(styles.cell, styles.hide)} key={`ticketable-${alertDefinition.id}`}>
            <Checkbox value={alertDefinition.ticket_enabled} onChange={()=>{}} label="Ticketable" />
          </div>
        </div>
        <div className={styles.spacer} />
        <div className={styles.headerStats}>
          <Stats stats={{count: (alertDefinition.alerting + alertDefinition.pending + alertDefinition.normal), alerting: alertDefinition.alerting, pending: alertDefinition.pending, normal: alertDefinition.normal}} />
        </div>
        {!!actionIcons.length && (
          <>
            <div className={styles.actionsSeparator}>|</div>
            <div className={styles.actionIcons}>{actionIcons}</div>
          </>
        )}
      </div>
      {!isCollapsed &&
      <div className={styles.relative}>
        {(alerts.length > 0) &&  <div className={cx(styles.headerGuideline, styles.guideline)} />}
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
      }
      {!isCollapsed && renderAlertInstances()}
      <AlertSettings isOpen={isConfiguring}  onCancel={(open: boolean ) => { setIsConfiguring(open);}} alert={alert}/>
    </div>
  );
});

AlertDefinitionItem.displayName = 'AlertDefinitionItem';

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
    grid-template-columns: 40px 20px 150px 300px 120px 120px 120px 100px;
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
});
