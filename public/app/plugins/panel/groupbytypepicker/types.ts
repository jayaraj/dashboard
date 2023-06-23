import { css } from '@emotion/css';

import { stylesFactory } from '@grafana/ui';

export interface GroupByTypePickerOptions {
  filter: string;
  label: string;
}

export const defaults: GroupByTypePickerOptions = {
  filter: '',
  label: '',
};

export const getStyles = stylesFactory(() => {
  return {
    wrapper: css`
      display: flex;
      flex-direction: column;
      position: relative;
      height: 100%;
    `,
  };
});
