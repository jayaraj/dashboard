import { css } from '@emotion/css';

import { GrafanaTheme } from '@grafana/data';
import { stylesFactory } from '@grafana/ui';

export interface GroupNavigatorOptions {
  label: string;
}

export const defaults: GroupNavigatorOptions = {
  label: '',
};

export enum TreeState {
  Expanded = 'expanded',
  Collapsed = 'collapsed',
}

export const getStyles = stylesFactory((height: number, theme: GrafanaTheme) => {
  const { md } = theme.spacing;
  const ht = height - 220;
  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
    `,
    spinner: css`
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
    `,
    resultsContainer: css`
      position: relative;
      margin-bottom: ${md};
      height: ${ht}px;
    `,
    search: css`
      display: flex;
      flex-direction: column;
      height: 100%;
    `,
  };
});
