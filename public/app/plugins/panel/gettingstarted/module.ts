///<reference path="../../../headers/common.d.ts" />

import {PanelCtrl} from 'app/plugins/sdk';

import {contextSrv} from 'app/core/core';

class GettingStartedPanelCtrl extends PanelCtrl {
  static templateUrl = 'public/app/plugins/panel/gettingstarted/module.html';
  checksDone: boolean;
  stepIndex: number;
  steps: any;

  /** @ngInject **/
  constructor($scope, $injector, private backendSrv, private datasourceSrv, private $q) {
    super($scope, $injector);

    /* tslint:disable */
    if (contextSrv.user.helpFlags1 & 1) {
      this.row.removePanel(this.panel, false);
      return;
    }
    /* tslint:enable */

    this.stepIndex = 0;
    this.steps = [];

    if (!contextSrv.hasRole('Admin')) {
      this.steps.push({
        cta: 'Basic Concepts Guide',
        icon: 'fa fa-file-text-o',
        href: 'http://docs.grafana.org/guides/basic_concepts/',
        check: () => $q.when(false),
        cssClass: 'active',
      });

      this.steps.push({
        cta: 'Getting Started Guide',
        icon: 'fa fa-file-text-o',
        href: 'http://docs.grafana.org/guides/getting_started/',
        check: () => $q.when(false),
        cssClass: 'active',
      });

      this.steps.push({
        cta: 'Building a dashboard',
        icon: 'fa fa-film',
        href: 'http://docs.grafana.org/tutorials/screencasts/',
        check: () => $q.when(false),
        cssClass: 'active',
      });

      return;
    }

    this.steps.push({
      title: 'Install Grafana',
      icon: 'icon-gf icon-gf-check',
      check: () => $q.when(true),
    });

    this.steps.push({
      title: 'Create your first data source',
      cta: 'Add data source',
      icon: 'icon-gf icon-gf-datasources',
      href: 'datasources/new?gettingstarted',
      check: () => {
        return $q.when(
          datasourceSrv.getMetricSources().filter(item => {
            return item.meta.builtIn === false;
          }).length > 0
        );
      }
    });

    this.steps.push({
      title: 'Create your first dashboard',
      cta: 'New dashboard',
      icon: 'icon-gf icon-gf-dashboard',
      href: 'dashboard/new?gettingstarted',
      check: () => {
        return this.backendSrv.search({limit: 1}).then(result => {
          return result.length > 0;
        });
      }
    });

    this.steps.push({
      title: 'Invite your team',
      cta: 'Add Users',
      icon: 'icon-gf icon-gf-users',
      href: 'org/users?gettingstarted',
      check: () => {
        return  this.backendSrv.get('api/org/users').then(res => {
          return res.length > 1;
        });
      }
    });


    this.steps.push({
      title: 'Install apps & plugins',
      cta: 'Explore plugin repository',
      icon: 'icon-gf icon-gf-apps',
      href: 'https://grafana.net/plugins?utm_source=grafana_getting_started',
      check: () => {
        return this.backendSrv.get('api/plugins', {embedded: 0, core: 0}).then(plugins => {
          return plugins.length > 0;
        });
      }
    });
  }

  $onInit() {
    this.stepIndex = -1;
    return this.nextStep().then(res => {
      this.checksDone = true;
      console.log(this.steps);
    });
  }

  nextStep() {
    if (this.stepIndex === this.steps.length - 1) {
      return this.$q.when();
    }

    this.stepIndex += 1;
    var currentStep = this.steps[this.stepIndex];
    return currentStep.check().then(passed => {
      if (passed) {
        currentStep.cssClass = 'completed';
        return this.nextStep();
      }

      currentStep.cssClass = 'active';
      return this.$q.when();
    });
  }

  dismiss() {
    this.row.removePanel(this.panel, false);

    this.backendSrv.request({
      method: 'PUT',
      url: '/api/user/helpflags/1',
      showSuccessAlert: false,
    }).then(res => {
      contextSrv.user.helpFlags1 = res.helpFlags1;
    });
  }
}

export {GettingStartedPanelCtrl, GettingStartedPanelCtrl as PanelCtrl}
