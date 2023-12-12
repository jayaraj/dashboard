import { DataSourcePlugin } from '@grafana/data';

import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { DataSource } from './datasource';
import { Query, DataSourceOptions } from './types';

export const plugin = new DataSourcePlugin<DataSource, Query, DataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
