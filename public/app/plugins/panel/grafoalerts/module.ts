import { PanelPlugin } from '@grafana/data';

import { GrafoAlerts } from './components/GrafoAlerts';
import { GrafoAlertsOptions } from './types';

export const plugin = new PanelPlugin<GrafoAlertsOptions>(GrafoAlerts).setPanelOptions((builder) => {
  return builder;
});
