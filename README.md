# Anakin Plop Templates

Templates for module for Anakin for the Angular 1.5 + TypeScript

## Generators

### module
    input:  moduleName
    action: generate anakin module skeleton
            add module to modules
    
    skeleton:
        ${moduleName}
            component
               ${moduleName}-components.module.ts
            service
               ${moduleName}-services.module.ts 
            state
               ${moduleName}-states.module.ts
            ${moduleName}.module.ts    
    
### component
    input:  componentName moduleName
    action: generate anakin component in module
            add component to ${moduleName}-components.modules.ts
            
    created files:
            ${moduleName}/component/${componentName}/${componentName}.component.ts
            ${moduleName}/component/${componentName}/${componentName}.template.ts

### state
    input:  stateName moduleName
    action: generate anakin state in module
            add state to ${moduleName}-states.modules.ts
            add state to ${moduleName}-state-names.modules.ts

    created files:
            ${moduleName}/state/${stateName}.state.ts
            ${moduleName}/component/${componentName}/${stateName}.component.ts
            ${moduleName}/component/${componentName}/${stateName}.template.ts       
                 
### service
    input:  serviceName moduleName
    action: generate anakin service in module
            add service to ${moduleName}-services.modules.ts
            
    created files:
                ${moduleName}/service/${serviceName}.service.ts           

Small component, which will be reusable in many places.
Generates: `html`, `scss`, `component typescript` and wiring to the existing app.

### How to use

```bash
npm i --save-dev plop@1.9.1
npm i --save-dev plop-generator-anakin
touch plopfile.js
```

paste (and adjust) following code in plopFile.js:

```JS
module.exports = require('plop-generator-anakin', {
  modulesDir: 'modules',
  modulesDef: 'modules.ts',
});
```

add to package.json
```JS
  "scripts": {
    "plop": "plop"
  },
```

add to modules.ts file (or modulesDef config parameter defined file):
   - after next line of last import
   ```JS
     // @plop-import
   ```
  - after next line of angular module import
   ```JS
     // @plop-module
   ```
  - sample
  ```JS
    import * as angular from 'angular';
    // @plop-import
    
    const AppModules = angular
      .module('app.modules', [
        penzugyiModuleState,
        // @plop-module
      ])
  ```
   
