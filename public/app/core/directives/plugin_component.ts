///<reference path="../../headers/common.d.ts" />

import angular from 'angular';
import _ from 'lodash';

import config from 'app/core/config';
import coreModule from 'app/core/core_module';
import {UnknownPanelCtrl} from 'app/plugins/panel/unknown/module';

/** @ngInject **/
function pluginDirectiveLoader($compile, datasourceSrv, $rootScope, $q, $http, $templateCache) {

  function getTemplate(component) {
    if (component.template) {
      return $q.when(component.template);
    }
    var cached = $templateCache.get(component.templateUrl);
    if (cached) {
      return $q.when(cached);
    }
    return $http.get(component.templateUrl).then(res => {
      return res.data;
    });
  }

  function getPluginComponentDirective(options) {
    return function() {
      return {
        templateUrl: options.Component.templateUrl,
        template: options.Component.template,
        restrict: 'E',
        controller: options.Component,
        controllerAs: 'ctrl',
        bindToController: true,
        scope: options.bindings,
        link: (scope, elem, attrs, ctrl) => {
          if (ctrl.link) {
            ctrl.link(scope, elem, attrs, ctrl);
          }
          if (ctrl.init) {
            ctrl.init();
          }
        }
      };
    };
  }

  function loadPanelComponentInfo(scope, attrs) {
    var componentInfo: any = {
      name: 'panel-plugin-' + scope.panel.type,
      bindings: {dashboard: "=", panel: "=", row: "="},
      attrs: {dashboard: "dashboard", panel: "panel", row: "row"},
    };

    var panelElemName = 'panel-' + scope.panel.type;
    let panelInfo = config.panels[scope.panel.type];
    var panelCtrlPromise = Promise.resolve(UnknownPanelCtrl);
    if (panelInfo) {
      panelCtrlPromise = System.import(panelInfo.module).then(function(panelModule) {
        return panelModule.PanelCtrl;
      });
    }

    return panelCtrlPromise.then(function(PanelCtrl: any) {
      componentInfo.Component = PanelCtrl;

      if (!PanelCtrl || PanelCtrl.registered) {
        return componentInfo;
      };

      if (PanelCtrl.templatePromise) {
        return PanelCtrl.templatePromise.then(res => {
          return componentInfo;
        });
      }

      PanelCtrl.templatePromise = getTemplate(PanelCtrl).then(template => {
        PanelCtrl.templateUrl = null;
        PanelCtrl.template = `<grafana-panel ctrl="ctrl">${template}</grafana-panel>`;
        return componentInfo;
      });

      return PanelCtrl.templatePromise;
    });
  }

  function getModule(scope, attrs) {
    switch (attrs.type) {
      // QueryCtrl
      case "query-ctrl": {
        let datasource = scope.target.datasource || scope.ctrl.panel.datasource;
        return datasourceSrv.get(datasource).then(ds => {
          scope.datasource = ds;

          return System.import(ds.meta.module).then(dsModule => {
            return {
              name: 'query-ctrl-' + ds.meta.id,
              bindings: {target: "=", panelCtrl: "=", datasource: "="},
              attrs: {"target": "target", "panel-ctrl": "ctrl", datasource: "datasource"},
              Component: dsModule.QueryCtrl
            };
          });
        });
      }
      // QueryOptionsCtrl
      case "query-options-ctrl": {
        return datasourceSrv.get(scope.ctrl.panel.datasource).then(ds => {
          return System.import(ds.meta.module).then((dsModule): any => {
            if (!dsModule.QueryOptionsCtrl) {
              return {notFound: true};
            }

            return {
              name: 'query-options-ctrl-' + ds.meta.id,
              bindings: {panelCtrl: "="},
              attrs: {"panel-ctrl": "ctrl"},
              Component: dsModule.QueryOptionsCtrl
            };
          });
        });
      }
      // Annotations
      case "annotations-query-ctrl": {
        return System.import(scope.currentDatasource.meta.module).then(function(dsModule) {
          return {
            name: 'annotations-query-ctrl-' + scope.currentDatasource.meta.id,
            bindings: {annotation: "=", datasource: "="},
            attrs: {"annotation": "currentAnnotation", datasource: "currentDatasource"},
            Component: dsModule.AnnotationsQueryCtrl,
          };
        });
      }
      // ConfigCtrl
      case 'datasource-config-ctrl': {
        return System.import(scope.datasourceMeta.module).then(function(dsModule) {
          return {
            name: 'ds-config-' + scope.datasourceMeta.id,
            bindings: {meta: "=", current: "="},
            attrs: {meta: "datasourceMeta", current: "current"},
            Component: dsModule.ConfigCtrl,
          };
        });
      }
      // AppConfigCtrl
      case 'app-config-ctrl': {
        let appModel = scope.ctrl.appModel;
        return System.import(appModel.module).then(function(appModule) {
          return {
            name: 'app-config-' + appModel.appId,
            bindings: {appModel: "=", appEditCtrl: "="},
            attrs: {"app-model": "ctrl.appModel", "app-edit-ctrl": "ctrl"},
            Component: appModule.ConfigCtrl,
          };
        });
      }
      // App Page
      case 'app-page': {
        let appModel = scope.ctrl.appModel;
        return System.import(appModel.module).then(function(appModule) {
          return {
            name: 'app-page-' + appModel.appId + '-' + scope.ctrl.page.slug,
            bindings: {appModel: "="},
            attrs: {"app-model": "ctrl.appModel"},
            Component: appModule[scope.ctrl.page.component],
          };
        });
      }
      // Panel
      case 'panel': {
        return loadPanelComponentInfo(scope, attrs);
      }
      default: {
        return $q.reject({message: "Could not find component type: " + attrs.type });
      }
    }
  }

  function appendAndCompile(scope, elem, componentInfo) {
    var child = angular.element(document.createElement(componentInfo.name));
    _.each(componentInfo.attrs, (value, key) => {
      child.attr(key, value);
    });

    $compile(child)(scope);

    elem.empty();
    elem.append(child);
  }

  function registerPluginComponent(scope, elem, attrs, componentInfo) {
    if (componentInfo.notFound) {
      elem.empty();
      return;
    }

    if (!componentInfo.Component) {
      throw {message: 'Failed to find exported plugin component for ' + componentInfo.name};
    }

    if (!componentInfo.Component.registered) {
      var directiveName = attrs.$normalize(componentInfo.name);
      var directiveFn = getPluginComponentDirective(componentInfo);
      coreModule.directive(directiveName, directiveFn);
      componentInfo.Component.registered = true;
    }

    appendAndCompile(scope, elem, componentInfo);
  }

  return {
    restrict: 'E',
    link: function(scope, elem, attrs) {
      getModule(scope, attrs).then(function (componentInfo) {
        registerPluginComponent(scope, elem, attrs, componentInfo);
      }).catch(err => {
        $rootScope.appEvent('alert-error', ['Plugin Error', err.message || err]);
        console.log('Plugin componnet error', err);
      });
    }
  };
}

coreModule.directive('pluginComponent', pluginDirectiveLoader);
