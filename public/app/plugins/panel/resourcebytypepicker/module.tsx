import { PanelPlugin } from '@grafana/data';

import { ResourceByTypePickerPanel } from './ResourceByTypePickerPanel';
import { defaults, ResourceByTypePickerOptions } from './types';

export const plugin = new PanelPlugin<ResourceByTypePickerOptions>(ResourceByTypePickerPanel).setPanelOptions(
  (builder) => {
    return builder
      .addTextInput({
        description: 'Filter resources by matching resource type',
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
  }
);
