import { css } from '@emotion/css';

import { GrafanaTheme } from '@grafana/data';
import * as ui from '@grafana/schema';
import { stylesFactory } from '@grafana/ui';

export interface CsvButtonOptions extends ui.SingleStatBaseOptions {
  heading: string;
  filename: string;
  useExcelHeader: boolean;
}

export const getStyles = stylesFactory((height: number, theme: GrafanaTheme) => {
  const { md } = theme.spacing;
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
      margin-bottom: ${md};
      margin-top: ${md};
      height: ${ht}px;
    `,
  };
});
