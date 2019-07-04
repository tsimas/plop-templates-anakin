import * as angular from 'angular';

export default class {{component.name}} implements angular.IController {
  static create(): angular.IComponentOptions {
    return {
      templateUrl: require('{{component.templateUrl}}'),
      controller: {{component.controller}},
      transclude: false,
      bindings: {
      },
    };
  }
  constructor() {
    /* ngInject */
  }

  $onInit() {
  }
}
