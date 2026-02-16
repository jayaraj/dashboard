import { PanelPlugin } from '@grafana/data';

import { ApplicationApiEditor } from './components/ApplicationApiEditor';
import { CsvDownloadPanel } from './components/CsvDownloadPanel';
import { DatasourceEditor } from './components/DatasourceEditor';
import { FieldFilterEditor } from './components/FieldFilterEditor';
import { QueryArgumentsEditor } from './components/QueryArgumentsEditor';
import { TransformOptionsEditor } from './components/TransformOptionsEditor';
import { CsvDownloadOptions, QueryArgument, AppApiValue, FieldFilterOptions, TransformOptions } from './types';

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
      })
      .addCustomEditor({
        id: 'fieldFilter',
        path: 'fieldFilter',
        name: 'Field Filtering',
        description: 'Filter fields to include or exclude in the CSV export',
        editor: FieldFilterEditor,
        defaultValue: { mode: 'include', fieldNames: [] } as FieldFilterOptions,
      })
      .addCustomEditor({
        id: 'transformations',
        path: 'transformations',
        name: 'Data Transformations',
        description: 'Sort, rename, and convert field types before export',
        editor: TransformOptionsEditor,
        defaultValue: {} as TransformOptions,
      });
  });
