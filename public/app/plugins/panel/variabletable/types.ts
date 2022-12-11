import { css } from '@emotion/css';

import { VariableModel, GrafanaTheme } from '@grafana/data';
import { stylesFactory } from '@grafana/ui';

export interface VariableTableOptions {
  heading: string;
  selectedVariables: string[];
}

export type RuntimeVariableOption = {
  id: number;
  value: string;
  text: string;
  selected?: boolean;
};

export type RuntimeVariableModel = VariableModel & {
  options: RuntimeVariableOption[];
  id: string;
};

export const getStyles = stylesFactory((height: number, theme: GrafanaTheme) => {
  const { lg } = theme.spacing;
  const ht = height - 220;
  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    `,
    resultsContainer: css`
      position: relative;
      margin-bottom: ${lg};
      margin-top: ${lg};
      height: ${ht}px;
    `,
    table: css`
    width: 100%;
    td:first-child {
      width: 100%;
      border-bottom: 1px solid ${theme.colors.bodyBg};
      padding: 2px;
    }
  `,
  };
});
