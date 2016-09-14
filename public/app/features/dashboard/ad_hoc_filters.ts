///<reference path="../../headers/common.d.ts" />

import _ from 'lodash';
import angular from 'angular';
import coreModule from 'app/core/core_module';

export class AdHocFiltersCtrl {
  segments: any;
  variable: any;
  removeTagFilterSegment: any;

  /** @ngInject */
  constructor(private uiSegmentSrv, private datasourceSrv, private $q, private templateSrv, private $rootScope) {
    this.removeTagFilterSegment = uiSegmentSrv.newSegment({fake: true, value: '-- remove filter --'});
    this.buildSegmentModel();
  }

  buildSegmentModel() {
    this.segments = [];

    if (this.variable.value && !_.isArray(this.variable.value)) {
    }

    for (let tag of this.variable.value) {
      if (this.segments.length > 0) {
        this.segments.push(this.uiSegmentSrv.newCondition('AND'));
      }

      if (tag.key !== undefined && tag.value !== undefined) {
        this.segments.push(this.uiSegmentSrv.newKey(tag.key));
        this.segments.push(this.uiSegmentSrv.newOperator(tag.operator));
        this.segments.push(this.uiSegmentSrv.newKeyValue(tag.value));
      }
    }

    this.segments.push(this.uiSegmentSrv.newPlusButton());
  }

  getOptions(segment, index) {
    if (segment.type === 'operator') {
      return this.$q.when(this.uiSegmentSrv.newOperators(['=', '!=', '<>', '<', '>', '=~', '!~']));
    }

    return this.datasourceSrv.get(this.variable.datasource).then(ds => {
      var options: any = {};
      var promise = null;

      if (segment.type !== 'value') {
        promise = ds.getTagKeys();
      } else {
        options.key = this.segments[index-2].value;
        promise = ds.getTagValues(options);
      }

      return promise.then(results => {
        results = _.map(results, segment => {
          return this.uiSegmentSrv.newSegment({value: segment.text});
        });

        // add remove option for keys
        if (segment.type === 'key') {
          results.splice(0, 0, angular.copy(this.removeTagFilterSegment));
        }
        return results;
      });
    });
  }

  segmentChanged(segment, index) {
    this.segments[index] = segment;

    // handle remove tag condition
    if (segment.value === this.removeTagFilterSegment.value) {
      this.segments.splice(index, 3);
      if (this.segments.length === 0) {
        this.segments.push(this.uiSegmentSrv.newPlusButton());
      } else if (this.segments.length > 2) {
        this.segments.splice(Math.max(index-1, 0), 1);
        if (this.segments[this.segments.length-1].type !== 'plus-button') {
          this.segments.push(this.uiSegmentSrv.newPlusButton());
        }
      }
    } else {
      if (segment.type === 'plus-button') {
        if (index > 2) {
          this.segments.splice(index, 0, this.uiSegmentSrv.newCondition('AND'));
        }
        this.segments.push(this.uiSegmentSrv.newOperator('='));
        this.segments.push(this.uiSegmentSrv.newFake('select tag value', 'value', 'query-segment-value'));
        segment.type = 'key';
        segment.cssClass = 'query-segment-key';
      }

      if ((index+1) === this.segments.length) {
        this.segments.push(this.uiSegmentSrv.newPlusButton());
      }
    }

    this.updateVariableModel();
  }

  updateVariableModel() {
    var tags = [];
    var tagIndex = -1;
    var tagOperator = "";

    this.segments.forEach((segment, index) => {
      if (segment.fake) {
        return;
      }

      switch (segment.type) {
        case 'key': {
          tags.push({key: segment.value});
          tagIndex += 1;
          break;
        }
        case 'value': {
          tags[tagIndex].value = segment.value;
          break;
        }
        case 'operator': {
          tags[tagIndex].operator = segment.value;
          break;
        }
        case 'condition': {
          break;
        }
      }
    });

    this.$rootScope.$broadcast('refresh');
    this.variable.value = tags;
  }
}

var template = `
<div class="gf-form-inline">
  <div class="gf-form" ng-repeat="segment in ctrl.segments">
    <metric-segment segment="segment" get-options="ctrl.getOptions(segment, $index)"
                    on-change="ctrl.segmentChanged(segment, $index)"></metric-segment>
  </div>
</div>
`;

export function adHocFiltersComponent() {
  return {
    restrict: 'E',
    template: template,
    controller: AdHocFiltersCtrl,
    bindToController: true,
    controllerAs: 'ctrl',
    scope: {
      variable: "="
    }
  };
}

coreModule.directive('adHocFilters', adHocFiltersComponent);
