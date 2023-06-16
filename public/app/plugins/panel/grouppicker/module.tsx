import { PanelPlugin } from '@grafana/data';

import { GroupPickerPanel } from './ GroupPickerPanel';
import { defaults, GroupPickerOptions } from './types';

export const plugin = new PanelPlugin<GroupPickerOptions>(GroupPickerPanel)
.setPanelOptions((builder) => {
  return builder
    .addTextInput({
      description: 'Filter groups by matching group type',
      name: 'Filter',
      path: 'filter',
      category: ['Picker Options'],
      defaultValue: defaults.filter,
    })
    .addTextInput({
      description: 'Label',
      name: 'Label',
      path: 'label',
      category: ['Picker Options'],
      defaultValue: defaults.label,
    });
});
