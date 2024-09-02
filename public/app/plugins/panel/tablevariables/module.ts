import { PanelPlugin } from '@grafana/data';
import { defaultTableFieldOptions } from '@grafana/schema';

import { HeadersEditor } from './components/HeadersEditor';
import { TableVariables } from './components/TableVariable';
import { TableVariablesOptions, defaults } from './types';

export const plugin = new PanelPlugin<TableVariablesOptions>(TableVariables)
.useFieldConfig({
  useCustomConfig: (builder) => {
    builder
      .addNumberInput({
        path: 'minWidth',
        name: 'Minimum column width',
        description: 'The minimum width for column auto resizing',
        settings: {
          placeholder: '150',
          min: 50,
          max: 500,
        },
        shouldApply: () => true,
        defaultValue: defaultTableFieldOptions.minWidth,
      })
      .addNumberInput({
        path: 'width',
        name: 'Column width',
        settings: {
          placeholder: 'auto',
          min: 20,
          max: 300,
        },
        shouldApply: () => true,
        defaultValue: defaultTableFieldOptions.width,
      })
      .addRadio({
        path: 'align',
        name: 'Column alignment',
        settings: {
          options: [
            { label: 'auto', value: 'auto' },
            { label: 'left', value: 'left' },
            { label: 'center', value: 'center' },
            { label: 'right', value: 'right' },
          ],
        },
        defaultValue: defaultTableFieldOptions.align,
      })
      .addBooleanSwitch({
        path: 'hidden',
        name: 'Hide in table',
        defaultValue: undefined,
        hideFromDefaults: true,
      });
  },
})
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
      path: 'sort',
      category: ['Search Options'],
      defaultValue: defaults.sort,
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
