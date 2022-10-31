import { PanelPlugin } from '@grafana/data';

import { GroupNavigatorPanel } from './ GroupNavigatorPanel';
import { defaults, GroupNavigatorOptions } from './types';

export const plugin = new PanelPlugin<GroupNavigatorOptions>(GroupNavigatorPanel)
.setPanelOptions((builder) => {
  return builder
    .addTextInput({
      description: 'Filter root groups by matching labels',
      name: 'Label',
      path: 'label',
      category: ['Filter'],
      defaultValue: defaults.label,
    });
});
