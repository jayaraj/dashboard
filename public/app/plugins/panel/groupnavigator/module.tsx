import { PanelPlugin } from '@grafana/data';

import { GroupNavigatorPanel } from './ GroupNavigatorPanel';
import { GroupNavigatorOptions } from './types';

export const plugin = new PanelPlugin<GroupNavigatorOptions>(GroupNavigatorPanel);
