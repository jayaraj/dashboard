import { css, cx } from '@emotion/css';
import React, { useMemo, useState, useEffect } from 'react';

import { GrafanaTheme2, dateTimeFormatISO } from '@grafana/data';
import { useStyles2, Checkbox } from '@grafana/ui';
import { OrgRole } from 'app/types';
import { Alert, AlertingState } from 'app/types/devicemanagement/alert';

import { ActionIcon } from './ActionIcon';
import { AlertLabels } from './AlertLabels';
import AlertSettings from './AlertSettings';
import { AlertStateTag } from './AlertStateTag';
import { DynamicTable } from './DynamicTable';
import { DynamicTableWithGuidelines } from './DynamicTableWithGuidelines';
import { DynamicTableColumnProps, DynamicTableItemProps, DynamicTablePagination } from './utils';

interface Props {
  alerts: Alert[];
  showGuidelines: boolean;
  className?: string;
  pagination: DynamicTablePagination;
  onEdit: () => void;
  association: string;
  associationReference: number | string;
}

type AlertTableColumnProps = DynamicTableColumnProps<Alert>;
type AlertTableItemProps = DynamicTableItemProps<Alert>;

const columns: AlertTableColumnProps[] = [
  {
    id: 'state',
    label: 'Name',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { state, name, message } }) => (
      <AlertStateTag state={state as AlertingState} name={name} message={message} />
    ),
    size: '150px',
  },
  {
    id: 'labels',
    label: 'Labels',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { data } }) => {
      const styles = useStyles2(getStyles);
      return <AlertLabels className={styles.start} labels={data} />;
    },
  },
  {
    id: 'created',
    label: 'Created',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { updated_at } }) => {
      const styles = useStyles2(getStyles);
      const created = dateTimeFormatISO(new Date(updated_at));
      return (
        <div className={styles.text}>{created.startsWith('0001') ? '-' : created.slice(0, 19).replace('T', ' ')}</div>
      );
    },
    size: '150px',
  },
  {
    id: 'enabled',
    label: 'Enabled',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { enabled } }) => {
      const styles = useStyles2(getStyles);
      return <div className={styles.center}>{<Checkbox value={enabled} onChange={() => {}} />}</div>;
    },
    size: '60px',
  },
  {
    id: 'action',
    label: 'Action',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data }) => {
      const actionIcons: React.ReactNode[] = [];
      const styles = useStyles2(getStyles);
      actionIcons.push(
        <ActionIcon
          aria-label="configure alert"
          data-testid="configure-alert"
          key="configure"
          icon="pen"
          tooltip="configure alert"
          onClick={() => data.setConfiguringAlert(data)}
        />
      );
      return (
        <div className={styles.center}>
          <div className={styles.actionIcons}>{actionIcons}</div>
        </div>
      );
    },
    size: '70px',
  },
];

export function AlertInstances(props: Props): JSX.Element | null {
  const { alerts, pagination, showGuidelines, className, onEdit, association, associationReference } = props;
  const styles = useStyles2(getStyles);
  const wrapperClass = cx(styles.wrapper, className, { [styles.wrapperMargin]: showGuidelines });
  const TableComponent = showGuidelines ? DynamicTableWithGuidelines : DynamicTable;
  const [alert, setAlert] = useState<Alert>({
    id: 0,
    org_id: 0,
    resource_id: 0,
    group_path: '',
    state: '',
    message: '',
    updated_at: '',
    alert_definition_id: 0,
    name: '',
    description: '',
    associated_with: '',
    association_reference: 0,
    role: OrgRole.Viewer,
    severity: '',
    for: 0,
    ticket_enabled: false,
    enabled: false,
    data: {},
    configuration: {},
    onEdit: () => {
      onEdit();
    },
    setConfiguringAlert: (alert: Alert) => {},
  });
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);

  useEffect(() => {
    if (alert.id !== 0) {
      setIsConfiguring(true);
    } else {
      setIsConfiguring(false);
    }
  }, [alert]);

  const items = useMemo(
    (): AlertTableItemProps[] =>
      alerts.map((instance) => {
        const alert = { ...instance, onEdit: onEdit, setConfiguringAlert: setAlert };
        return {
          data: alert,
          id: instance.id,
        };
      }),
    [alerts]
  );

  if (!items.length) {
    return <div className={cx(wrapperClass, styles.emptyMessage)}>No alerts found.</div>;
  }

  return (
    <div className={wrapperClass} data-testid="rules-table">
      <TableComponent cols={columns} items={items} pagination={pagination} paginationStyles={styles.pagination} />
      <AlertSettings
        isOpen={isConfiguring}
        onCancel={(open: boolean) => {
          setIsConfiguring(open);
          setAlert({
            id: 0,
            org_id: 0,
            resource_id: 0,
            group_path: '',
            state: '',
            message: '',
            updated_at: '',
            alert_definition_id: 0,
            name: '',
            description: '',
            associated_with: '',
            association_reference: 0,
            role: OrgRole.Viewer,
            severity: '',
            for: 0,
            ticket_enabled: false,
            enabled: false,
            data: {},
            configuration: {},
            onEdit: () => {
              onEdit();
            },
            setConfiguringAlert: (alert: Alert) => {},
          });
        }}
        alert={alert}
        association={association}
        associationReference={associationReference}
      />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
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
    wrapperMargin: css`
      ${theme.breakpoints.up('md')} {
        margin-left: 36px;
      }
    `,
    wrapper: css`
      width: auto;
      border-radius: ${theme.shape.borderRadius()};
    `,
    emptyMessage: css`
      padding: ${theme.spacing(1)};
    `,
    center: css`
      justify-content: center;
      display: flex;
    `,
    start: css`
      justify-content: flex-start;
      display: flex;
    `,
    text: css`
      position: relative;
      align-items: center;
      display: flex;
      flex: 1 1 auto;
      flex-wrap: wrap;
      flex-shrink: 0;
      gap: 6px;
      color: ${theme.colors.text.secondary};
      font-size: ${theme.typography.size.sm};
    `,
    actionIcons: css`
      & > * + * {
        margin-left: ${theme.spacing(0.5)};
      }
    `,
  };
};
