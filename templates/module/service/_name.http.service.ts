import { IHttpService } from 'angular';
import {{moduleVariableName}}HttpInterface from './{{moduleName}}.http.interface';
import BaseService from '../../_services/base.service';

export default class {{moduleVariableName}}HttpServiceBaseImpl extends BaseService implements {{moduleVariableName}}HttpInterface {
  constructor() {
    /* ngInject */
    super('cri/{{moduleName}}');
  }
}
