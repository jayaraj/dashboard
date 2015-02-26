define([
  'angular',
  'config',
],
function (angular, config) {
  'use strict';

  var module = angular.module('grafana.controllers');

  module.controller('ProfileCtrl', function($scope, backendSrv) {

    $scope.init = function() {
      $scope.getUser();
      $scope.getUserOrgs();
    };

    $scope.getUser = function() {
      backendSrv.get('/api/user').then(function(user) {
        $scope.user = user;
      });
    };

    $scope.getUserOrgs = function() {
      backendSrv.get('/api/user/orgs').then(function(orgs) {
        $scope.orgs = orgs;
      });
    };

    $scope.setUsingOrg = function(org) {
      backendSrv.post('/api/user/using/' + org.orgId).then(function() {
        window.location.href = config.appSubUrl + '/profile';
      });
    };

    $scope.update = function() {
      if (!$scope.userForm.$valid) { return; }
      backendSrv.put('/api/user/', $scope.user);
    };

    $scope.init();

  });
});
