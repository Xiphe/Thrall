module.exports = function moduleFactory(thrallConfig) {
  'use strict';

  if (!thrallConfig || !thrallConfig.grunt) {
    throw new Error('Thrall is missing a grunt to work with!');
  }

  var baseInjector = require('./injector')(thrallConfig.grunt);

  return baseInjector.createChild([{
    applyTaskOptions: ['factory', require('./applyTaskOptions')],
    baseInjector: ['value', baseInjector],
    thrallConfig: ['value', thrallConfig],
    init: ['factory', require('./init')],
    registerSubtasks: ['factory', require('./registerSubtasks')],
    loadSubConfigs: ['factory', require('./loadSubConfigs')],
    addTasks: ['factory', require('./addTasks')],
    task: ['factory', require('./task')]
  }]);
};

