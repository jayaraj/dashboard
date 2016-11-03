///<reference path="../../headers/common.d.ts" />

import config from 'app/core/config';
import _ from 'lodash';
import $ from 'jquery';

import coreModule from 'app/core/core_module';
import appEvents from 'app/core/app_events';

export class UtilSrv {
  modalScope: any;

  /** @ngInject */
  constructor(private $rootScope, private $modal) {
  }

  init() {
    appEvents.on('show-modal', this.showModal.bind(this), this.$rootScope);
  }

  showModal(options) {
    if (this.modalScope && this.modalScope.dismiss) {
      this.modalScope.dismiss();
    }

    if (options.model || !options.scope) {
      options.scope = this.modalScope = this.$rootScope.$new();
      options.scope.model = options.model;
    }

    this.modalScope = options.scope;

    var modal = this.$modal({
      modalClass: options.modalClass,
      template: options.src,
      templateHtml: options.templateHtml,
      persist: false,
      show: false,
      scope: options.scope,
      keyboard: false,
      backdrop: options.backdrop
    });

    Promise.resolve(modal).then(function(modalEl) {
      modalEl.modal('show');
    });
  }
}

coreModule.service('utilSrv', UtilSrv);
