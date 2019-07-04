import { IStateService, IStateProvider, IStateParamsService } from 'angular-ui-router';
import { {{moduleVariableName}}StateNames } from '../{{moduleName}}-state-names';
import {{moduleVariableName}}HttpInterface from '../../service/{{moduleName}}.http.interface';
import { ServiceLocator } from '@judo/framework';
import { IQService } from 'angular';

export class {{stateVariableName}}Dto {

}

class {{stateVariableName}}{{stateControllerPostfix}} {
  constructor($scope: angular.IScope, {{stateInjectVariableName}}: {{stateVariableName}}Dto) {
    /* ngInject */
    $scope.{{stateInjectVariableName}} = {{stateInjectVariableName}};
  }
}

const {{stateVariableName}}{{statePostfix}} = ($stateProvider: IStateProvider) => {
  $stateProvider.state({{moduleVariableName}}StateNames.{{stateVariableName}}, {
    url: '{{moduleName}}/{{stateName}}',
    parent: 'app.module_layout',
    template: '<{{stateName}}-view {{stateInjectVariableName}}="{{stateInjectVariableName}}"></{{stateName}}-view>',
    controller: {{stateVariableName}}{{stateControllerPostfix}},
    data: {
      isSpinner: true,
      uuid: {{moduleVariableName}}StateNames.{{stateVariableName}},
      parentModule: 'Anakin_anakin_business_domain_ugylet',
      pageTitle: (): string => {
        const translateFilter = ServiceLocator.locate('translateFilter');
        return translateFilter('anakin-{{moduleName}}-{{stateName}}-state-title');
      },
      isProtected: true,
      selections: {},
    },
    params: {},
    resolve: {
      {{stateInjectVariableName}}: ($stateParams: IStateParamsService, $q: IQService, {{moduleVariableName}}HttpService: {{moduleVariableName}}HttpInterface) => {
        /* ngInject */
        if ($stateParams.{{stateInjectVariableName}}) {
          const defer = $q.defer();
          defer.resolve($stateParams.{{stateInjectVariableName}});
          $stateParams.elzalogositas = null;
          return defer.promise;
        }
        // http call -> need to implement!
      },
    },
  });
};

export default {{stateVariableName}}{{statePostfix}};
