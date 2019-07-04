'use strict';

const path = require('path');
const fs = require('fs-extra');
const plopTemplates = path.resolve(__dirname, './templates/');

let modulesDir, modulesDef, srcDir;

const moduleModuleNamePostfix = 'RDModule';
const componentModuleNamePostfix = 'ComponentModule';
const serviceModuleNamePostfix = 'ServiceModule';
const stateModuleNamePostfix = 'StateModule';
const stateControllerPostfix = 'StateController';
const statePostfix = 'State';

function isPathAvailable(dir, name) {
  return !fs.existsSync(path.join(dir, name));
}

function normalizeFileName(name) {
  return name.replace(/([A-Z])/g, "-$1").toLowerCase();
}

function normalizeVariableName(name) {
  return name.split('-').map(function capitalize(part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join('');
}

function validateFileOrDirectoryName(name, destDir, postfix = '') {
  if (!(/.+/).test(name))
    return 'Empty name provided. Try again';


  const normalizedName = normalizeFileName(name) + postfix;
  if (!isPathAvailable(destDir, normalizedName))
    return 'There is already exists element with provided name! Try again';

  return true;
}

function validateDirectoryNotExists(name, destDir, postfix = '') {
  if (!(/.+/).test(name))
    return 'Empty name provided. Try again';

  const normalizedName = normalizeFileName(name) + postfix;
  if (isPathAvailable(destDir, normalizedName))
    return `Missing module directory ${normalizedName}`;
  return true;
}

function copyFiles(srcDir, destDir, fileName) {
  fs.mkdirpSync(destDir);
  const files = fs.readdirSync(srcDir);

  files.forEach(f => {
    if (fs.lstatSync(path.join(srcDir, f)).isFile()) {
      fs.copySync(path.join(srcDir, f), path.join(destDir, f.replace('_name', fileName)));
    } else {
      copyFiles(path.join(srcDir, f), path.join(destDir, f), fileName)
    }
  });
}

function modifyFiles(dir, fn) {
  const newFiles = fs.readdirSync(dir);
  newFiles.forEach(f => {
    if (fs.lstatSync(path.join(dir, f)).isFile()) {
      const fileName = path.join(dir, f);
      const fileContent = fn(fs.readFileSync(fileName, 'utf-8'));

      fs.writeFileSync(fileName, fileContent, 'utf-8');
    } else {
      modifyFiles(path.join(dir, f), fn)
    }
  });

  return newFiles.length;
}

function appendToFile(filePath, regexStr, text) {
  const regex = new RegExp(regexStr, 'g');
  let fileContent = fs.readFileSync(filePath, 'utf-8');
  let patternIndex = fileContent.search(regex);
  if(patternIndex < 0) {
    console.log(`No matches found to regex str: ${regexStr} in ${filePath}`);
    return;
  }

  fileContent = fileContent.slice(0, patternIndex) + (text + '\n') + fileContent.slice(patternIndex);
  fs.writeFileSync(filePath, fileContent, 'utf-8');
}

function generateTemplateVariablesForModuleGenerator(moduleName) {
  const moduleVariableName = normalizeVariableName(moduleName);
  return {
    moduleVariableName,
    moduleName,
    moduleModuleNamePostfix,
    componentModuleNamePostfix,
    serviceModuleNamePostfix,
    stateModuleNamePostfix,
  }
}

function generateTemplateVariablesForComponentGenerator(componentName) {
  const componentVariableName = normalizeVariableName(componentName);
  return {
    name: `${componentVariableName}Component`,
    angularName: `${componentVariableName}`,
    controller: `${componentVariableName}Component`,
    templateUrl: `./${componentName}.template.html`,
  }
}

function generateTemplateVariablesForServiceGenerator(serviceName) {
  const serviceVariableName = normalizeVariableName(serviceName);
  return {
    name: `${serviceVariableName}Service`,
  }
}

function generateTemplateVariablesForStateGenerator(stateName, moduleName) {
  const moduleVariableName = normalizeVariableName(moduleName);
  const stateVariableName = normalizeVariableName(stateName);
  return {
    moduleVariableName,
    moduleName,
    stateVariableName,
    stateName,
    stateControllerPostfix,
    stateInjectVariableName: stateVariableName.charAt(0).toLowerCase() + stateVariableName.substring(1),
    statePostfix,
    component: {
      name: `${stateVariableName}ViewComponent`,
      angularName: `${stateVariableName}View`,
      controller: `${stateVariableName}ViewComponent`,
      templateUrl: `./${stateName}-view.template.html`,
    }
  }
}

/** Generators */

module.exports = (plop, config) => {
  // Config defaults.
  config = config || {};
  srcDir     = config.srcDir || 'src/';
  modulesDir = config.modulesDir || 'modules/';
  modulesDef = config.modulesDef || 'modules.ts';


  plop.setGenerator('module', {
    description: 'create Anakin module skeleton',
    prompts: [
      {
        type: 'input',
        name: 'moduleName',
        message: 'Please provide a module name:',
        validate: (value) => validateFileOrDirectoryName(value, path.join(srcDir, modulesDir))
      }
    ],
    actions: [
      function run(answers) {
        try {

          process.chdir(plop.getPlopfilePath());
          answers.moduleName = answers.moduleName.charAt(0).toLowerCase() + answers.moduleName.substring(1);

          const moduleName = normalizeFileName(answers.moduleName);
          const handleBarCtx = generateTemplateVariablesForModuleGenerator(moduleName);

          const destDir = path.join(srcDir, modulesDir, moduleName);
          const templateDir = path.join(plopTemplates, 'module');

          copyFiles(templateDir, destDir, moduleName);

          const filesChanged = modifyFiles(destDir,
            (fileContent) => plop.renderString(fileContent, handleBarCtx)
          );

          appendToFile(path.join(srcDir, modulesDir, modulesDef),
            '// @plop-import', `import ${handleBarCtx.moduleVariableName} from './${moduleName}/${moduleName}.module';`);
          appendToFile(path.join(srcDir, modulesDir, modulesDef),
            '// @plop-module' ,`${handleBarCtx.moduleVariableName},`);

          return `${filesChanged} files autogenerated for you in ${destDir}`;
        }
        catch (err) {
          console.log(err);
          throw err;
        }
      }
    ]
  });

  plop.setGenerator('component', {
    description: 'create Anakin component skeleton',
    prompts: [
      {
        type: 'input',
        name: 'componentName',
        message: 'Please provide a component name:',
      },
      {
        type: 'input',
        name: 'moduleName',
        message: 'Please provide a module name:',
        validate: (value) => validateDirectoryNotExists(value, path.join(srcDir, modulesDir))
      }
    ],
    actions: [
      function run(answers) {
        try {
          const validate = validateFileOrDirectoryName(answers.componentName, path.join(srcDir, modulesDir, normalizeFileName(answers.moduleName),'component'));
          if (validate.length > 0 ) {
            throw new Error(validate);
          }

          answers.moduleName = answers.moduleName.charAt(0).toLowerCase() + answers.moduleName.substring(1);
          answers.componentName = answers.componentName.charAt(0).toLowerCase() + answers.componentName.substring(1)

          process.chdir(plop.getPlopfilePath());
          const moduleName = normalizeFileName(answers.moduleName);
          const componentName = normalizeFileName(answers.componentName);
          const handleBarCtx = generateTemplateVariablesForComponentGenerator(componentName);
          const moduleHandleBarCtx = generateTemplateVariablesForModuleGenerator(moduleName);

          const destDir = path.join(srcDir, modulesDir, moduleName, 'component', componentName);
          const templateDir = path.join(plopTemplates, 'component');

          copyFiles(templateDir, destDir, componentName);

          const filesChanged = modifyFiles(destDir,
            (fileContent) => plop.renderString(fileContent, handleBarCtx)
          );

          appendToFile(path.join(srcDir, modulesDir, moduleName, 'component', `${moduleName}-components.module.ts`),
            '// @plop-import', `import ${handleBarCtx.name} from './${componentName}/${componentName}.component';`);
          appendToFile(path.join(srcDir, modulesDir, moduleName, 'component', `${moduleName}-components.module.ts`),
            '// @plop-component' ,`.component('${handleBarCtx.angularName}', ${handleBarCtx.name}.create())`);

          return `${filesChanged} files autogenerated for you in ${destDir}`;
        }
        catch (err) {
          console.log(err);
          throw err;
        }
      }
    ]
  });

  plop.setGenerator('service', {
    description: 'create Anakin service skeleton',
    prompts: [
      {
        type: 'input',
        name: 'serviceName',
        message: 'Please provide a service name:',
      },
      {
        type: 'input',
        name: 'moduleName',
        message: 'Please provide a module name:',
        validate: (value) => validateDirectoryNotExists(value, path.join(srcDir, modulesDir))
      }
    ],
    actions: [
      function run(answers) {
        try {
          const validate = validateFileOrDirectoryName(answers.serviceName, path.join(srcDir, modulesDir, normalizeFileName(answers.moduleName),'service'));
          if (validate.length > 0 ) {
            throw new Error(validate);
          }

          answers.moduleName = answers.moduleName.charAt(0).toLowerCase() + answers.moduleName.substring(1);
          answers.serviceName = answers.serviceName.charAt(0).toLowerCase() + answers.serviceName.substring(1)

          process.chdir(plop.getPlopfilePath());
          const moduleName = normalizeFileName(answers.moduleName);
          const serviceName = normalizeFileName(answers.serviceName);
          const handleBarCtx = generateTemplateVariablesForServiceGenerator(serviceName);
          const moduleHandleBarCtx = generateTemplateVariablesForModuleGenerator(moduleName);

          const destDir = path.join(srcDir, modulesDir, moduleName, 'service');
          const templateDir = path.join(plopTemplates, 'service');

          copyFiles(templateDir, destDir, serviceName);

          const filesChanged = modifyFiles(destDir,
            (fileContent) => plop.renderString(fileContent, handleBarCtx)
          );

          appendToFile(path.join(srcDir, modulesDir, moduleName, 'service', `${moduleName}-services.module.ts`),
            '// @plop-import', `import ${handleBarCtx.name} from './${serviceName}.service';`);
          appendToFile(path.join(srcDir, modulesDir, moduleName, 'service', `${moduleName}-services.module.ts`),
            '// @plop-service' ,`.service('${handleBarCtx.name}', ${handleBarCtx.name})`);

          //  .service('szerzodeskezelesService', SzerzodesKezelesServiceImpl)
          return `${filesChanged} files autogenerated for you in ${destDir}`;
        }
        catch (err) {
          console.log(err);
          throw err;
        }
      }
    ]
  });

  plop.setGenerator('state', {
    description: 'create Anakin state skeleton',
    prompts: [
      {
        type: 'input',
        name: 'stateName',
        message: 'Please provide a state name:',
      },
      {
        type: 'input',
        name: 'moduleName',
        message: 'Please provide a module name:',
        validate: (value) => validateDirectoryNotExists(value, path.join(srcDir, modulesDir))
      }
    ],
    actions: [
      function run(answers) {
        try {
          const validate = validateFileOrDirectoryName(answers.stateName, path.join(srcDir, modulesDir, normalizeFileName(answers.moduleName),'state'));
          if (validate.length > 0 ) {
            throw new Error(validate);
          }

          answers.moduleName = answers.moduleName.charAt(0).toLowerCase() + answers.moduleName.substring(1);
          answers.stateName = answers.stateName.charAt(0).toLowerCase() + answers.stateName.substring(1)

          process.chdir(plop.getPlopfilePath());
          const moduleName = normalizeFileName(answers.moduleName);
          const stateName = normalizeFileName(answers.stateName);
          const handleBarCtx = generateTemplateVariablesForStateGenerator(stateName, moduleName);
          const moduleHandleBarCtx = generateTemplateVariablesForModuleGenerator(moduleName);

          const destDir = path.join(srcDir, modulesDir, moduleName, 'state', stateName);
          const templateDir = path.join(plopTemplates, 'state');

          copyFiles(templateDir, destDir, stateName);

          const filesChanged = modifyFiles(destDir,
            (fileContent) => plop.renderString(fileContent, handleBarCtx)
          );

          appendToFile(path.join(srcDir, modulesDir, moduleName, 'state', `${moduleName}-states.module.ts`),
            '// @plop-import', `import ${handleBarCtx.stateVariableName}${handleBarCtx.statePostfix} from './${stateName}/${stateName}.state';`);
          appendToFile(path.join(srcDir, modulesDir, moduleName, 'state', `${moduleName}-states.module.ts`),
            '// @plop-import', `import ${handleBarCtx.component.name} from './${stateName}/${stateName}-view.component';`);


          appendToFile(path.join(srcDir, modulesDir, moduleName, 'state', `${moduleName}-states.module.ts`),
            '  // @plop-state' ,`.config(${handleBarCtx.stateVariableName}${handleBarCtx.statePostfix})`);
          appendToFile(path.join(srcDir, modulesDir, moduleName, 'state', `${moduleName}-states.module.ts`),
            '// @plop-component' ,`.component('${handleBarCtx.component.angularName}', ${handleBarCtx.component.name}.create())`);


          appendToFile(path.join(srcDir, modulesDir, moduleName, 'state', `${moduleName}-state-names.ts`),
            '// @plop-stateName', `${handleBarCtx.stateVariableName} = '${handleBarCtx.stateVariableName}',`);

          //  szerzodeskezelesStateName = 'szerzodeskezeles',
          return `${filesChanged} files autogenerated for you in ${destDir}`;
        }
        catch (err) {
          console.log(err);
          throw err;
        }
      }
    ]
  });
};
