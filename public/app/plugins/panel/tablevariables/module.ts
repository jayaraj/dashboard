import { PanelPlugin } from '@grafana/data';

import { TableVariables } from './components/TableVariable';
import { TableVariablesOptions, defaults } from './types';

export const plugin = new PanelPlugin<TableVariablesOptions>(TableVariables).setPanelOptions((builder) => {
  return builder
    .addTextInput({
      description: 'Search Variable',
      name: 'Search Variable',
      path: 'search',
      category: ['Options'],
      defaultValue: defaults.search,
    })
    .addTextInput({
      description: 'Page Variable',
      name: 'Page Variable',
      path: 'page',
      category: ['Options'],
      defaultValue: defaults.page,
    })
    .addTextInput({
      description: 'PerPage Variable',
      name: 'PerPage Variable',
      path: 'perPage',
      category: ['Options'],
      defaultValue: defaults.perPage,
    })
    .addTextInput({
      description: 'PerPage Limit',
      name: 'PerPage Limit',
      path: 'perPageLimit',
      category: ['Options'],
      defaultValue: defaults.perPageLimit.toString(),
    });
});
