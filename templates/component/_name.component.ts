import * as angular from 'angular';

export default class {{name}} implements angular.IController {
  static create(): angular.IComponentOptions {
    return {
      templateUrl: require('{{templateUrl}}'),
      controller: {{controller}},
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
