import { css } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { Badge, useStyles2 } from '@grafana/ui';
import { AlertingState } from 'app/types/devicemanagement/alert';

interface Props {
  state: AlertingState;
  name: string;
}

export const AlertStateTag = ({ state, name }: Props) => {
  const styles = useStyles2(getStyles);

  switch (state) {
    case AlertingState.Alerting:
      return <Badge className={styles.badge} key="alerting" color="red" icon="exclamation-circle" text={name} />;
    case AlertingState.Pending:
      return <Badge className={styles.badge} key="pending" color="orange" icon="exclamation-triangle" text={name} />;
    case AlertingState.Normal:
      return <Badge className={styles.badge} key="normal" color="green" icon="check" text={name} />;
    default:
      return undefined;
  }
};

const getStyles = (theme: GrafanaTheme2) => ({
  badge: css`
    white-space: nowrap;
  `,
});
