module.exports = function moduleFactory(thrallConfig) {
  'use strict';

  if (!thrallConfig || !thrallConfig.grunt) {
    throw new Error('Thrall is missing a grunt to work with!');
  }

  var baseInjector = require('./injector')(thrallConfig.grunt);

  return baseInjector.createChild([{
    addTasks: ['factory', require('./addTasks')],
    applyTaskOptions: ['factory', require('./applyTaskOptions')],
    baseInjector: ['value', baseInjector],
    init: ['factory', require('./init')],
    loadSubConfigs: ['factory', require('./loadSubConfigs')],
    registerSubtasks: ['factory', require('./registerSubtasks')],
    runningTasks: ['factory', require('./runningTasks')],
    task: ['factory', require('./task')],
    thrallConfig: ['value', thrallConfig]
  }]);
};

