import { PanelPlugin } from '@grafana/data';

import { GroupByTypePickerPanel } from './ GroupByTypePickerPanel';
import { defaults, GroupByTypePickerOptions } from './types';

export const plugin = new PanelPlugin<GroupByTypePickerOptions>(GroupByTypePickerPanel)
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
