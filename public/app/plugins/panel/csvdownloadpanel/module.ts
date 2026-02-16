import { PanelPlugin } from '@grafana/data';

import { ApplicationApiEditor } from './components/ApplicationApiEditor';
import { CsvDownloadPanel } from './components/CsvDownloadPanel';
import { DatasourceEditor } from './components/DatasourceEditor';
import { QueryArgumentsEditor } from './components/QueryArgumentsEditor';
import { CsvDownloadOptions, QueryArgument, AppApiValue } from './types';

export const plugin = new PanelPlugin<CsvDownloadOptions>(CsvDownloadPanel)
  .useFieldConfig()
  .setPanelOptions((builder) => {
    return builder
      .addTextInput({
        path: 'heading',
        name: 'Button Heading',
        description: 'Button label text',
        defaultValue: 'Download CSV',
      })
      .addTextInput({
        path: 'filename',
        name: 'File Name',
        description: 'Name for the downloaded CSV file',
        defaultValue: 'export',
      })
      .addBooleanSwitch({
        name: 'Use Excel Header',
        path: 'useExcelHeader',
        defaultValue: false,
      })
      .addNumberInput({
        path: 'perPage',
        name: 'Records Per Page',
        description: 'Number of records to fetch per page (default: 200)',
        defaultValue: 200,
      })
      .addCustomEditor({
        id: 'datasource',
        path: 'datasource',
        name: 'Data Source',
        description: 'Select the grafoservice datasource',
        editor: DatasourceEditor,
        defaultValue: '',
      })
      .addCustomEditor({
        id: 'appApi',
        path: 'appApi',
        name: 'Application & API',
        description: 'Select application and API',
        editor: ApplicationApiEditor,
        defaultValue: { queryApplication: '', queryAPI: '' } as AppApiValue,
      })
      .addCustomEditor({
        id: 'queryArguments',
        path: 'queryArguments',
        name: 'Query Arguments',
        description: 'Additional query arguments (key-value pairs)',
        editor: QueryArgumentsEditor,
        defaultValue: [] as QueryArgument[],
      });
  });
