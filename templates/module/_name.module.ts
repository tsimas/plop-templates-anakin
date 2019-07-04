import * as angular from 'angular';

import {{moduleVariableName}}{{componentModuleNamePostfix}} from './component/{{moduleName}}-components.module';
import {{moduleVariableName}}{{serviceModuleNamePostfix}} from './service/{{moduleName}}-services.module';
import {{moduleVariableName}}{{stateModuleNamePostfix}} from './state/{{moduleName}}-states.module';

const {{moduleVariableName}}{{moduleModuleNamePostfix}} = angular
  .module('{{moduleVariableName}}{{moduleModuleNamePostfix}}', [
  {{moduleVariableName}}{{componentModuleNamePostfix}},
  {{moduleVariableName}}{{serviceModuleNamePostfix}},
  {{moduleVariableName}}{{stateModuleNamePostfix}},
  ]).name;

export default {{moduleVariableName}}{{moduleModuleNamePostfix}};
