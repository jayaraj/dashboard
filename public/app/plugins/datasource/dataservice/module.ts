import { DataserviceDatasource } from './datasource';
import { DataserviceDatasourceQueryCtrl } from './query_ctrl';

class DataserviceAnnotationsQueryCtrl {
  static templateUrl = 'partials/annotations.editor.html';
}

class DataserviceConfigCtrl {
  static templateUrl = 'partials/config.html';
}

class DataserviceQueryOptionsCtrl {
  static templateUrl = 'partials/query.options.html';
}

export {
  DataserviceDatasource as Datasource,
  DataserviceDatasourceQueryCtrl as QueryCtrl,
  DataserviceConfigCtrl as ConfigCtrl,
  DataserviceQueryOptionsCtrl as QueryOptionsCtrl,
  DataserviceAnnotationsQueryCtrl as AnnotationsQueryCtrl,
};
