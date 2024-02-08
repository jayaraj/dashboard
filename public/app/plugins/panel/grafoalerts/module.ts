import { PanelPlugin } from '@grafana/data';

import { GrafoAlerts } from './components/GrafoAlerts';
import { GrafoAlertsOptions } from './types';

export const plugin = new PanelPlugin<GrafoAlertsOptions>(GrafoAlerts).setPanelOptions((builder) => {
  return builder.addRadio({
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
  });
});