import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Badge, useStyles2 } from '@grafana/ui';
import { AlertingState } from 'app/types/devicemanagement/alert';

interface Props {
  state: AlertingState;
  name: string;
  message: string;
}

export const AlertStateTag = ({ state, name, message }: Props) => {
  const styles = useStyles2(getStyles);

  switch (state) {
    case AlertingState.Alerting:
      return (
        <Badge
          className={styles.badge}
          key="alerting"
          color="red"
          icon="exclamation-circle"
          text={name}
          tooltip={message}
        />
      );
    case AlertingState.Pending:
      return (
        <Badge
          className={styles.badge}
          key="pending"
          color="orange"
          icon="exclamation-triangle"
          text={name}
          tooltip={message}
        />
      );
    case AlertingState.Normal:
      return <Badge className={styles.badge} key="normal" color="green" icon="check" text={name} tooltip={message} />;
    default:
      return undefined;
  }
};

const getStyles = (theme: GrafanaTheme2) => ({
  badge: css`
    white-space: nowrap;
  `,
});
