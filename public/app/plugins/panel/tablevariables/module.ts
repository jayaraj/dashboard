import { PanelPlugin } from '@grafana/data';

import { HeadersEditor } from './components/HeadersEditor';
import { TableVariables } from './components/TableVariable';
import { TableVariablesOptions, defaults } from './types';

export const plugin = new PanelPlugin<TableVariablesOptions>(TableVariables)
.setPanelOptions((builder) => {
  return builder
    .addTextInput({
      description: 'Search Variable',
      name: 'Search Variable',
      path: 'search',
      category: ['Search Options'],
      defaultValue: defaults.search,
    })
    .addTextInput({
      description: 'Page Variable',
      name: 'Page Variable',
      path: 'page',
      category: ['Search Options'],
      defaultValue: defaults.page,
    })
    .addTextInput({
      description: 'PerPage Variable',
      name: 'PerPage Variable',
      path: 'perPage',
      category: ['Search Options'],
      defaultValue: defaults.perPage,
    })
    .addTextInput({
      description: 'PerPage Limit',
      name: 'PerPage Limit',
      path: 'perPageLimit',
      category: ['Search Options'],
      defaultValue: defaults.perPageLimit.toString(),
    })
    .addTextInput({
      description: 'Sort By Variable',
      name: 'Sort Variable',
      path: 'sortBy',
      category: ['Search Options'],
      defaultValue: defaults.sortBy,
    })
    .addTextInput({
      description: 'Desc Variable',
      name: 'Desc Variable',
      path: 'desc',
      category: ['Search Options'],
      defaultValue: defaults.desc,
    })
    .addRadio({
      path: 'showHeaders',
      name: 'Show Table headers',
      description: 'Display table headers with sort options',
      category: ['Table Headers'],
      settings: {
        options: [
          {
            value: false,
            label: 'Hidden',
          },
          {
            value: true,
            label: 'Visible',
          },
        ],
      },
      defaultValue: false,
    })
    .addCustomEditor({
      id: 'headers',
      path: 'headers',
      name: 'Table Headers',
      category: ['Table Headers'],
      description: 'Table Headers',
      editor: HeadersEditor,
      showIf: (config: any) => config.showHeaders === true,
    });
});
