import { PanelPlugin } from '@grafana/data';

import { GrafoAlerts } from './components/GrafoAlerts';
import { GrafoAlertsHistoryOptions } from './types';

export const plugin = new PanelPlugin<GrafoAlertsHistoryOptions>(GrafoAlerts).setPanelOptions((builder) => {
  return builder;
});
