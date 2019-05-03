import { DataSourcePlugin } from '@grafana/ui';
import { TestDataDatasource } from './datasource';
import { TestDataQueryCtrl } from './query_ctrl';
import { ConfigEditor } from './ConfigEditor';

class TestDataAnnotationsQueryCtrl {
  annotation: any;
  constructor() {}
  static template = '<h2>Annotation scenario</h2>';
}

export const plugin = new DataSourcePlugin(TestDataDatasource)
  .setConfigEditor(ConfigEditor)
  .setQueryCtrl(TestDataQueryCtrl)
  .setAnnotationQueryCtrl(TestDataAnnotationsQueryCtrl);
