import { css } from '@emotion/css';

import { stylesFactory } from '@grafana/ui';

export interface ResourceByTypePickerOptions {
  filter: string;
  label: string;
}

export const defaults: ResourceByTypePickerOptions = {
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
