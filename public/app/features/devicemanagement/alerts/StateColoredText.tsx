import { css } from '@emotion/css';
import React, { FC } from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';
import { AlertingState } from 'app/types';

type Props = {
  status: AlertingState | 'neutral';
};

export const StateColoredText: FC<Props> = ({ children, status }) => {
  const styles = useStyles2(getStyles);

  return <span className={styles[status]}>{children || status}</span>;
};

const getStyles = (theme: GrafanaTheme2) => ({
  [AlertingState.Normal]: css`
    color: ${theme.colors.success.text};
  `,
  [AlertingState.Pending]: css`
    color: ${theme.colors.warning.text};
  `,
  [AlertingState.Alerting]: css`
    color: ${theme.colors.error.text};
  `,
  neutral: css`
    color: ${theme.colors.text.secondary};
  `,
});
