import { PanelPlugin } from '@grafana/data';
import { CsvButtonPanel } from './CsvButtonPanel';
import { CsvButtonOptions } from './types';

export const plugin = new PanelPlugin<CsvButtonOptions>(CsvButtonPanel).setPanelOptions((builder) => {

  return builder
    .addTextInput({
      path: 'heading',
      name: 'Button Heading',
      description: 'Button label',
      defaultValue: 'Button',
      category: ['Configurations'],
    })
    .addTextInput({
      path: 'filename',
      name: 'File Name',
      description: 'File Name',
      defaultValue: 'csv',
      category: ['Configurations'],
    })
    .addBooleanSwitch({
      name: 'Use Excel Header',
      path: 'useExcelHeader',
      defaultValue: false,
      category: ['Configurations'],
    });
});
