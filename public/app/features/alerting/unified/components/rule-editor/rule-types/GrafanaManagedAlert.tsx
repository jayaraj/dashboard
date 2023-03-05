import React, { FC } from 'react';

import { RuleFormType } from '../../../types/rule-form';

import { RuleType, SharedProps } from './RuleType';

const GrafanaManagedRuleType: FC<SharedProps> = ({ selected = false, disabled, onClick }) => {
  return (
    <RuleType
      name="Dashboard managed alert"
      description={
        <span>
          Supports multiple data sources of any kind.
          <br />
          Transform data with expressions.
        </span>
      }
      image="public/img/custom/grafana_icon.svg"
      selected={selected}
      disabled={disabled}
      value={RuleFormType.grafana}
      onClick={onClick}
    />
  );
};

export { GrafanaManagedRuleType };
