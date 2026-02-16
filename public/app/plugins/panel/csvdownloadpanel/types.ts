import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';
import * as ui from '@grafana/schema';
import { stylesFactory } from '@grafana/ui';

export interface CsvDownloadOptions extends ui.SingleStatBaseOptions {
  heading: string;
  filename: string;
  useExcelHeader: boolean;
  perPage: number;
  datasource: string;
  appApi: AppApiValue;
  queryArguments: QueryArgument[];
}

// Keep these for backwards compatibility - values are read from appApi
export interface AppApiValue {
  queryApplication: string;
  queryAPI: string;
}

export interface QueryArgument {
  key: string;
  value: string;
}

export const getStyles = stylesFactory((height: number, theme: GrafanaTheme2) => {
  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    `,
    resultsContainer: css`
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      width: 100%;
    `,
    progressContainer: css`
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
    `,
    progressText: css`
      margin-top: 8px;
      font-size: 14px;
      color: ${theme.colors.text.secondary};
    `,
    progressBar: css`
      width: 200px;
      height: 8px;
      background-color: ${theme.colors.border.weak};
      border-radius: 4px;
      overflow: hidden;
    `,
    progressFill: css`
      height: 100%;
      background-color: ${theme.colors.primary.main};
      transition: width 0.3s ease;
    `,
    errorIcon: css`
      position: absolute;
      top: 8px;
      right: 8px;
      color: ${theme.colors.warning.main};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    `,
  };
});
