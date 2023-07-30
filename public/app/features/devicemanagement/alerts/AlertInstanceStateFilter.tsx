import { css } from '@emotion/css';
import { capitalize } from 'lodash';
import React from 'react';

import { GrafanaTheme2 } from '@grafana/data/src';
import { Label, RadioButtonGroup, Tag, useStyles2 } from '@grafana/ui';
import { AlertingState } from 'app/types';


interface Props {
  className?: string;
  stateFilter?: AlertingState;
  onStateFilterChange: (value?: AlertingState) => void;
  itemPerStateStats?: Record<string, number>;
}

export const AlertInstanceStateFilter = ({
  className,
  onStateFilterChange,
  stateFilter,
  itemPerStateStats,
}: Props) => {
  const styles = useStyles2(getStyles);

  const getOptionComponent = (state: AlertingState) => {
    return function InstanceStateCounter() {
      return itemPerStateStats && itemPerStateStats[state] ? (
        <Tag name={itemPerStateStats[state].toFixed(0)} colorIndex={9} className={styles.tag} />
      ) : null;
    };
  };

  const optionValues = [AlertingState.Alerting, AlertingState.Pending, AlertingState.Normal] as const;
  const promOptions = optionValues.map((state) => ({
    label: capitalize(state),
    value: state,
    component: getOptionComponent(state),
  }));

  return (
    <div className={className} data-testid="alert-instance-state-filter">
      <Label>State</Label>
      <RadioButtonGroup
        options={promOptions}
        value={stateFilter}
        onChange={onStateFilterChange}
        onClick={(v) => {
          if (v === stateFilter) {
            onStateFilterChange(undefined);
          }
        }}
      />
    </div>
  );
};

function getStyles(theme: GrafanaTheme2) {
  return {
    tag: css`
      font-size: 11px;
      font-weight: normal;
      padding: ${theme.spacing(0.25, 0.5)};
      vertical-align: middle;
      margin-left: ${theme.spacing(0.5)};
    `,
  };
}
