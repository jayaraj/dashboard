import { PanelPlugin } from '@grafana/data';

import { GrafoAlerts } from './components/GrafoAlerts';
import { GrafoAlertsOptions } from './types';

export const plugin = new PanelPlugin<GrafoAlertsOptions>(GrafoAlerts).setPanelOptions((builder) => {
  return builder.addTextInput({
    description: 'Group alias',
    name: 'Group Title',
    path: 'groupTitle',
    category: ['Options'],
    defaultValue: 'group',
  }).addTextInput({
    description: 'Resource alias',
    name: 'Resource Title',
    path: 'resourceTitle',
    category: ['Options'],
    defaultValue: 'resource',
  }).addRadio({
    path: 'history',
    name: 'History',
    description: 'Show/Hide history',
    category: ['Options'],
    settings: {
      options: [
        {
          value: false,
          label: 'Hide',
        },
        {
          value: true,
          label: 'Show',
        },
      ],
    },
    defaultValue: false,
  }).addRadio({
    path: 'linkOption',
    name: 'Link Option',
    description: 'On click open data link associated with the alert',
    category: ['Options'],
    settings: {
      options: [
        {
          value: false,
          label: 'False',
        },
        {
          value: true,
          label: 'True',
        },
      ],
    },
    defaultValue: false,
  }).addTextInput({
    description: 'This base URL will be appended with resource & group variables',
    name: 'Base URL',
    path: 'link',
    category: ['Options'],
    showIf: (config: any) => config.linkOption === true,
  });
});
