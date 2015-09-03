define([
  'angular',
  'lodash',
  './queryBuilder',
],
function (angular, _, ElasticQueryBuilder) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('ElasticQueryCtrl', function($scope, $timeout, uiSegmentSrv, templateSrv, $q) {

    $scope.functionList = ['count', 'min', 'max', 'total', 'mean'];

    $scope.functionMenu = _.map($scope.functionList, function(func) {
      return { text: func, click: "changeFunction('" + func + "');" };
    });

    $scope.init = function() {
      $scope.queryBuilder = new ElasticQueryBuilder(target);

      var target = $scope.target;
      target.function = target.function || 'mean';
      target.timeField = target.timeField || '@timestamp';
      target.select = target.select || [{ agg: 'count' }];
      target.groupByFields = target.groupByFields || [];

      $scope.timeSegment = uiSegmentSrv.newSegment(target.timeField);

      $scope.groupBySegments = _.map(target.groupByFields, function(group) {
        return uiSegmentSrv.newSegment(group.field);
      });

      $scope.initSelectSegments();
      $scope.groupBySegments.push(uiSegmentSrv.newPlusButton());
      $scope.removeSelectSegment = uiSegmentSrv.newSegment({fake: true, value: '-- remove select --'});
      $scope.resetSelectSegment = uiSegmentSrv.newSegment({fake: true, value: '-- reset --'});
      $scope.removeGroupBySegment = uiSegmentSrv.newSegment({fake: true, value: '-- remove group by --'});
    };

    $scope.initSelectSegments = function() {
      $scope.selectSegments = [];
      _.each($scope.target.select, function(select) {
        if ($scope.selectSegments.length > 0) {
          $scope.selectSegments.push(uiSegmentSrv.newCondition(" and "));
        }
        if (select.agg === 'count') {
          $scope.selectSegments.push(uiSegmentSrv.newSegment({value: select.agg, type: 'agg'}));
        } else {
          $scope.selectSegments.push(uiSegmentSrv.newSegment({value: select.agg, type: 'agg'}));
          $scope.selectSegments.push(uiSegmentSrv.newSegment({value: select.field, type: 'field' }));
        }
      });

      $scope.selectSegments.push(uiSegmentSrv.newPlusButton());
    };

    $scope.getSelectSegments = function(segment, index) {
      if (segment.type === 'agg' || segment.type === 'plus-button') {
        var options = [
          uiSegmentSrv.newSegment({value: 'count', type: 'agg'}),
          uiSegmentSrv.newSegment({value: 'min',   type: 'agg', reqField: true}),
          uiSegmentSrv.newSegment({value: 'max',   type: 'agg', reqField: true}),
          uiSegmentSrv.newSegment({value: 'avg',   type: 'agg', reqField: true}),
        ];
        if (segment.type !== 'plus-button' && $scope.selectSegments.length > 3) {
          options.splice(0, 0, angular.copy($scope.removeSelectSegment));
        }
        if (index === 0 && $scope.selectSegments.length > 2) {
          options.splice(0, 0, angular.copy($scope.resetSelectSegment));
        }
        return $q.when(options);
      }

      return $scope.datasource.metricFindQuery('fields()')
      .then($scope.transformToSegments(false))
      .then(null, $scope.handleQueryError);
    };

    $scope.selectChanged = function(segment, index) {
      // reset
      if (segment.value === $scope.resetSelectSegment.value) {
        $scope.target.select = [{ agg: 'count' }];
        $scope.initSelectSegments();
        $scope.get_data();
        return;
      }

      // remove this select field
      if (segment.value === $scope.removeSelectSegment.value) {
        var nextSegment = $scope.selectSegments[index + 1];
        var remove = 2;
        if (nextSegment && nextSegment.type === 'field') {
          remove += 1;
        }
        $scope.selectSegments.splice(Math.max(index-1, 0), remove);
        $scope.rebuildTargetSelects();
        $scope.get_data();
        return;
      }

      // add new
      if (segment.type === 'plus-button' && index > 0) {
        $scope.selectSegments.splice(index, 0, uiSegmentSrv.newCondition(' And '));
        segment.type = 'agg';
        index += 1;
      }

      if (segment.type === 'agg')  {
        var nextSegment = $scope.selectSegments[index + 1];

        if (segment.value === 'count' && nextSegment && nextSegment.type === 'field') {
          $scope.selectSegments.splice(index + 1, 1);
        } else if (!nextSegment || nextSegment.type !== 'field') {
          $scope.selectSegments.splice(index + 1, 0, uiSegmentSrv.newSegment({value: 'select field', fake: true, type: 'field'}));
        }
      }

      if ((index+1) === $scope.selectSegments.length) {
        $scope.selectSegments.push(uiSegmentSrv.newPlusButton());
      }

      $scope.rebuildTargetSelects();
      $scope.get_data();
    };

    $scope.rebuildTargetSelects = function() {
      $scope.target.select = [];
      for (var i = 0; i < $scope.selectSegments.length; i++) {
        var segment = $scope.selectSegments[i];
        var select = {agg: segment.value };

        if (segment.type === 'agg' && segment.value !== 'count') {
          select.field = $scope.selectSegments[i+1].value;
          i += 2;
        } else {
          i += 1;
        }

        if (select.field === 'select field') { continue; }
        $scope.target.select.push(select);
      };
    };

    $scope.getGroupByFields = function(segment) {
      return $scope.datasource.metricFindQuery('fields()').then($scope.transformToSegments(false))
      .then(function(results) {
        if (segment.type !== 'plus-button') {
          results.splice(0, 0, angular.copy($scope.removeGroupBySegment));
        }
        return results;
      })
      .then(null, $scope.handleQueryError);
    };

    $scope.groupByChanged = function(segment, index) {
      if (segment.value === $scope.removeGroupBySegment.value) {
        $scope.target.groupByFields.splice(index, 1);
        $scope.groupBySegments.splice(index, 1);
        $scope.$parent.get_data();
        return;
      }

      if (index === $scope.groupBySegments.length-1) {
        $scope.groupBySegments.push(uiSegmentSrv.newPlusButton());
      }

      segment.type = 'group-by-key';
      segment.fake = false;

      $scope.target.groupByFields[index] = {field: segment.value};
      $scope.$parent.get_data();
    };

    $scope.transformToSegments = function(addTemplateVars) {
      return function(results) {
        var segments = _.map(results, function(segment) {
          return uiSegmentSrv.newSegment({ value: segment.text, expandable: segment.expandable });
        });

        if (addTemplateVars) {
          _.each(templateSrv.variables, function(variable) {
            segments.unshift(uiSegmentSrv.newSegment({ type: 'template', value: '$' + variable.name, expandable: true }));
          });
        }

        return segments;
      };
    };

    $scope.handleQueryError = function(err) {
      $scope.parserError = err.message || 'Failed to issue metric query';
      return [];
    };

    $scope.toggleQueryMode = function () {
      $scope.target.rawQuery = !$scope.target.rawQuery;
    };

    $scope.init();

  });

});
