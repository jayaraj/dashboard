import { css, cx } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2, dateTimeFormatISO } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { getDashboardSrv } from 'app/features/dashboard/services/DashboardSrv';
import { AlertHistory, AlertingState } from 'app/types/devicemanagement/alert';

import { DynamicTablePagination, DynamicTableColumnProps } from '../types';

import { AlertLabels } from './AlertLabels';
import { AlertStateTag } from './AlertStateTag';
import { DynamicTable } from './DynamicTable';

interface Props {
  alerts: AlertHistory[];
  className?: string;
  pagination: DynamicTablePagination;
}

type AlertTableColumnProps = DynamicTableColumnProps<AlertHistory>;

const columns: AlertTableColumnProps[] = [
  {
    id: 'state',
    label: 'Name',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { state, name } }) => <AlertStateTag state={state as AlertingState} name={name} />,
    size: '150px',
  },
  {
    id: 'labels',
    label: 'Labels',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { context } }) => {
      const styles = useStyles2(getStyles);
      return <AlertLabels className={styles.start} labels={context} />;
    },
  },
  {
    id: 'created',
    label: 'Created',
    // eslint-disable-next-line react/display-name
    renderCell: ({ data: { time } }) => {
      const styles = useStyles2(getStyles);
      const timezone = getDashboardSrv().dashboard?.getTimezone();
      const created = dateTimeFormatISO(new Date(time), { timeZone: timezone });
      return (
        <div className={styles.text}>{created.startsWith('0001') ? '-' : created.slice(0, 19).replace('T', ' ')}</div>
      );
    },
    size: '150px',
  },
];

export function AlertInstances(props: Props): JSX.Element | null {
  const { alerts, pagination, className } = props;
  const styles = useStyles2(getStyles);
  const wrapperClass = cx(styles.wrapper, className);

  const items = alerts.map((instance, index) => {
    return {
      data: instance,
      id: index,
    };
  });

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
    icon: css({
      marginRight: '6px',
    }),
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
    radio: css({
      position: 'relative',
      appearance: 'none',
      outline: 'none',
      backgroundColor: theme.colors.background.canvas,
      width: `${theme.spacing(2)} !important` /* TODO How to overcome this? Checkbox does the same 🙁 */,
      height: theme.spacing(2),
      border: `1px solid ${theme.colors.border.medium}`,
      borderRadius: theme.shape.radius.circle,
      margin: '3px 0' /* Space for box-shadow when focused */,

      ':checked': {
        backgroundColor: theme.v1.palette.white,
        border: `5px solid ${theme.colors.primary.main}`,
      },

      ':disabled': {
        backgroundColor: `${theme.colors.action.disabledBackground} !important`,
        borderColor: theme.colors.border.weak,
      },

      ':disabled:checked': {
        border: `1px solid ${theme.colors.border.weak}`,
      },

      ':disabled:checked::after': {
        content: '""',
        width: '6px',
        height: '6px',
        backgroundColor: theme.colors.text.disabled,
        borderRadius: theme.shape.radius.circle,
        display: 'inline-block',
        position: 'absolute',
        top: '4px',
        left: '4px',
      },

      ':focus': {
        outline: 'none !important',
        boxShadow: `0 0 0 1px ${theme.colors.background.canvas}, 0 0 0 3px ${theme.colors.primary.main}`,
      },
    }),
  };
};
