import { css, cx } from '@emotion/css';
import React, { useMemo, useState } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2, Checkbox } from '@grafana/ui';
import { Alert, AlertingState } from 'app/types';
import { ActionIcon } from './ActionIcon';
import { AlertLabels } from './AlertLabels';
import AlertSettings from './AlertSettings';
import { AlertStateTag } from './AlertStateTag';
import { DynamicTable, } from './DynamicTable';
import { DynamicTableWithGuidelines } from './DynamicTableWithGuidelines';
import { DynamicTableColumnProps, DynamicTableItemProps, DynamicTablePagination } from './utils';

interface Props {
  alerts: Alert[];
  showGuidelines: boolean;
  className?: string;
  pagination: DynamicTablePagination;
  onEdit: () => void;
}

type AlertTableColumnProps = DynamicTableColumnProps<Alert>;
type AlertTableItemProps = DynamicTableItemProps<Alert>;

const columns: AlertTableColumnProps[] = [
  {
    id: 'state',
    label: 'State',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { state } }) => <AlertStateTag state={state as AlertingState} />,
    size: '80px',
  },
  {
    id: 'message',
    label: 'Message',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { message } }) => (
      <>{message}</>
    ),
    size: '300px',
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
    id: 'enabled',
    label: 'Enabled',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { enabled } }) => {
      const styles = useStyles2(getStyles);
      return <div className={styles.center}>{<Checkbox value={enabled} onChange={()=>{}}/>}</div>;
    },
    size: '60px',
  },
  {
    id: 'created',
    label: 'Created',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { updated_at } }) => (
      <>{updated_at.startsWith('0001') ? '-' : updated_at.slice(0, 19).replace('T', ' ')}</>
    ),
    size: '150px',
  },
  {
    id: 'action',
    label: 'Action',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data }) => {
      const actionIcons: React.ReactNode[] = [];
      let [isConfiguring, setIsConfiguring] = useState<boolean>(false);
      const styles = useStyles2(getStyles);
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
      return (
        <div className={styles.center}>
          <div className={styles.actionIcons}>{actionIcons}</div>
          <AlertSettings isOpen={isConfiguring}  onCancel={(open: boolean ) => { setIsConfiguring(open);}} alert={data}/>
        </div>
      );
    },
    size: '70px',
  },
];

export function AlertInstances(props: Props): JSX.Element | null {
  const {alerts, pagination, showGuidelines, className, onEdit} = props;
  const styles = useStyles2(getStyles);
  const wrapperClass = cx(styles.wrapper, className, { [styles.wrapperMargin]: showGuidelines });
  const TableComponent = showGuidelines ? DynamicTableWithGuidelines : DynamicTable;

  const items = useMemo(
    (): AlertTableItemProps[] =>
      alerts.map((instance) => {
        const alert = {...instance, onEdit:onEdit};
        return {
        data: alert,
        id: instance.id,
      };}),
    [alerts]
  );

  if (!items.length) {
    return <div className={cx(wrapperClass, styles.emptyMessage)}>No alerts found.</div>;
  }

  return (
    <div className={wrapperClass} data-testid="rules-table">
      <TableComponent
        cols={columns}
        items={items}
        pagination={pagination}
        paginationStyles={styles.pagination}
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
    actionIcons: css`
      & > * + * {
        margin-left: ${theme.spacing(0.5)};
      }
    `,
  };
};