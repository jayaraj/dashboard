///<reference path="../../headers/common.d.ts" />

import coreModule from 'app/core/core_module';

export default class UserGroupsCtrl {
  userGroups: any;
  pages = [];
  perPage = 50;
  page = 1;
  totalPages: number;
  showPaging = false;
  query: any = '';

  /** @ngInject */
  constructor(private $scope, private $http, private backendSrv) {
    this.get();
  }

  get() {
    this.backendSrv.get(`/api/user-groups/search?perpage=${this.perPage}&page=${this.page}&query=${this.query}`)
      .then((result) => {
        this.userGroups = result.userGroups;
        this.page = result.page;
        this.perPage = result.perPage;
        this.totalPages = Math.ceil(result.totalCount / result.perPage);
        this.showPaging = this.totalPages > 1;
        this.pages = [];

        for (var i = 1; i < this.totalPages+1; i++) {
          this.pages.push({ page: i, current: i === this.page});
        }
      });
  }

  navigateToPage(page) {
    this.page = page.page;
    this.get();
  }

  deleteUserGroup(userGroup) {
    this.$scope.appEvent('confirm-modal', {
      title: 'Delete',
      text: 'Are you sure you want to delete User Group ' + userGroup.name + '?',
      yesText: "Delete",
      icon: "fa-warning",
      onConfirm: () => {
        this.deleteUserGroupConfirmed(userGroup);
      }
    });
  }

  deleteUserGroupConfirmed(userGroup) {
    this.backendSrv.delete('/api/user-groups/' + userGroup.id)
      .then(this.get.bind(this));
  }

  openUserGroupModal() {
    var modalScope = this.$scope.$new();

    this.$scope.appEvent('show-modal', {
      src: 'public/app/features/org/partials/add_user.html',
      modalClass: 'user-group-modal',
      scope: modalScope
    });
  }
}

coreModule.controller('UserGroupsCtrl', UserGroupsCtrl);
