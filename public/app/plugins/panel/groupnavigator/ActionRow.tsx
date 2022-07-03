import { css } from '@emotion/css';
import React, { FC } from 'react';

import { GrafanaTheme } from '@grafana/data';
import { HorizontalGroup, stylesFactory, useTheme, RadioButtonGroup } from '@grafana/ui';

import { TreeState } from './types';

interface Props {
  treeState: TreeState;
  onTreeChange: (type: TreeState) => void;
}

export const typeOptions = [
  { value: TreeState.Collapsed, icon: 'folder', ariaLabel: 'Collapse folders' },
  { value: TreeState.Expanded, icon: 'folder-open', ariaLabel: 'Expand folders' },
];

export const ActionRow: FC<Props> = ({ treeState, onTreeChange }) => {
  const theme = useTheme();
  const styles = getStyles(theme);

  return (
    <div className={styles.actionRow}>
      <div className={styles.rowContainer}>
        <HorizontalGroup spacing="md" width="auto">
          <RadioButtonGroup options={typeOptions} onChange={onTreeChange} value={treeState} />
        </HorizontalGroup>
      </div>
    </div>
  );
};

ActionRow.displayName = 'ActionRow';

const getStyles = stylesFactory((theme: GrafanaTheme) => {
  return {
    actionRow: css`
      display: none;

      @media only screen and (min-width: ${theme.breakpoints.md}) {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: ${theme.spacing.lg} 0;
        width: 100%;
      }
    `,
    rowContainer: css`
      margin-right: ${theme.spacing.md};
    `,
    checkboxWrapper: css`
      label {
        line-height: 1.2;
      }
    `,
  };
});
