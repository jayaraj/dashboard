import { PanelPlugin } from '@grafana/data';

import { GrafoAlertsHistory } from './components/GrafoAlertsHistory';
import { GrafoAlertsHistoryOptions } from './types';

export const plugin = new PanelPlugin<GrafoAlertsHistoryOptions>(GrafoAlertsHistory).setPanelOptions((builder) => {
  return builder;
});
