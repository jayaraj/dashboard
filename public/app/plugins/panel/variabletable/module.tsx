import { PanelPlugin } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';

import { VariableTablePanel } from './VariableTablePanel';
import { VariableTableOptions } from './types';

export const plugin = new PanelPlugin<VariableTableOptions>(VariableTablePanel).setPanelOptions((builder) => {
  const variables = getTemplateSrv().getVariables();

  return builder
    .addSelect({
      path: 'selectedVariables',
      name: 'Select Variables to show',
      defaultValue: [] as any,
      settings: {
        options: variables.map((vr) => ({
          label: vr.name,
          value: vr.name,
        })),
      },
    })
    .addTextInput({
      path: 'heading',
      name: 'Panel Heading',
      description: 'Description of panel option',
      defaultValue: '',
    });
});
