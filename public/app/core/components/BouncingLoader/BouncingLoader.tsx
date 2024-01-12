import { css, keyframes } from '@emotion/css';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

import { t } from '../../internationalization';

export function BouncingLoader() {
  const styles = useStyles2(getStyles);

  return (
    <div
      className={styles.container}
      aria-live="polite"
      role="status"
      aria-label={t('bouncing-loader.label', 'Loading')}
    >
      <img alt="" src="public/img/whitelabel/loading.svg" className={styles.logo} />
    </div>
  );
}

const fadeIn = keyframes({
  '0%': {
    opacity: 0,
    animationTimingFunction: 'cubic-bezier(0, 0, 0.5, 1)',
  },
  '100%': {
    opacity: 1,
  },
});

const bounce = keyframes({
  'from, to': {
    transform: 'translateY(0px)',
    animationTimingFunction: 'cubic-bezier(0.3, 0, 0.1, 1)',
  },
  '50%': {
    transform: 'translateY(-50px)',
    animationTimingFunction: 'cubic-bezier(0.9, 0, 0.7, 1)',
  },
});

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    opacity: 0,
    animationName: fadeIn,
    animationIterationCount: 1,
    animationDuration: '0.9s',
    animationDelay: '0.5s',
    animationFillMode: 'forwards',
  }),

  bounce: css({
    textAlign: 'center',
    animationName: bounce,
    animationDuration: '0.9s',
    animationIterationCount: 'infinite',
  }),

  logo: css({
    display: 'inline-block',
    width: '60px',
    height: '60px',
  }),
});
