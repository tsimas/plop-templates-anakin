import * as angular from 'angular';
import {{moduleVariableName}}HttpServiceBaseImpl from './{{moduleName}}.http.service';

// @plop-import
const {{moduleVariableName}}{{serviceModuleNamePostfix}} = angular
  .module('{{moduleVariableName}}{{serviceModuleNamePostfix}}', [])
  .service('{{moduleVariableName}}HttpService', {{moduleVariableName}}HttpServiceBaseImpl)
  // @plop-service
  .name;

export default {{moduleVariableName}}{{serviceModuleNamePostfix}};
