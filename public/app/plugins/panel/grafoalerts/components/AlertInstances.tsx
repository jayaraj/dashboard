import { css, cx } from '@emotion/css';
import React, { useMemo } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { Alert, AlertingState } from 'app/types/devicemanagement/alert';

import { DynamicTablePagination, DynamicTableColumnProps, DynamicTableItemProps } from '../types';

import { AlertLabels } from './AlertLabels';
import { AlertStateTag } from './AlertStateTag';
import { DynamicTable } from './DynamicTable';

interface Props {
  alerts: Alert[];
  className?: string;
  pagination: DynamicTablePagination;
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
      return (
        <div className={styles.text}>
          {updated_at.startsWith('0001') ? '-' : updated_at.slice(0, 19).replace('T', ' ')}
        </div>
      );
    },
    size: '150px',
  },
];

export function AlertInstances(props: Props): JSX.Element | null {
  const { alerts, pagination, className } = props;
  const styles = useStyles2(getStyles);
  const wrapperClass = cx(styles.wrapper, className);
  const items = useMemo(
    (): AlertTableItemProps[] =>
      alerts.map((instance) => {
        return {
          data: instance,
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
      <DynamicTable cols={columns} items={items} pagination={pagination} paginationStyles={styles.pagination} />
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
  };
};
