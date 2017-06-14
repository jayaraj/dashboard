///<reference path="../../headers/common.d.ts" />

import coreModule from 'app/core/core_module';
import _ from 'lodash';

export default class UserGroupDetailsCtrl {
  userGroup: UserGroup;
  userGroupMembers: User[] = [];
  userId: number;
  navModel: any;
  addMemberForm: any;

  constructor(private $scope, private $http, private backendSrv, private $routeParams, navModelSrv) {
    this.navModel = navModelSrv.getOrgNav(3);
    this.get();
  }

  get() {
    if (this.$routeParams && this.$routeParams.id) {
      this.backendSrv.get(`/api/user-groups/${this.$routeParams.id}`)
        .then(result => {
          this.userGroup = result;
        });
      this.backendSrv.get(`/api/user-groups/${this.$routeParams.id}/members`)
        .then(result => {
          this.userGroupMembers = result;
        });
    }
  }

  removeUserGroupMember(userGroupMember: UserGroupMember) {
    this.$scope.appEvent('confirm-modal', {
      title: 'Remove Member',
      text: 'Are you sure you want to remove ' + userGroupMember.name + ' from this group?',
      yesText: "Remove",
      icon: "fa-warning",
      onConfirm: () => {
        this.removeMemberConfirmed(userGroupMember);
      }
    });
  }

  removeMemberConfirmed(userGroupMember: UserGroupMember) {
    this.backendSrv.delete(`/api/user-groups/${this.$routeParams.id}/members/${userGroupMember.userId}`)
      .then(this.get.bind(this));
  }

  update() {
    if (!this.$scope.userGroupDetailsForm.$valid) { return; }

    this.backendSrv.put('/api/user-groups/' + this.userGroup.id, {name: this.userGroup.name});
  }

  addMember() {
    if (!this.addMemberForm.$valid) { return; }

    this.backendSrv.post(`/api/user-groups/${this.$routeParams.id}/members`, {userId: this.userId}).then(() => {
      this.userId = null;
      this.get();
    });
  }
}

export interface UserGroup {
  id: number;
  name: string;
}

export interface User {
  id: number;
  name: string;
  login: string;
  email: string;
}

export interface UserGroupMember {
  userId: number;
  name: string;
}

coreModule.controller('UserGroupDetailsCtrl', UserGroupDetailsCtrl);

