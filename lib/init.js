module.exports = function initFactory(
  thrallConfig,
  path,
  grunt,
  registerSubtasks,
  addTasks,
  baseInjector,
  _
) {
  'use strict';

  function normalizePaths() {
    if (!thrallConfig.dir) {
      throw new Error('Thall is missing a dir.');
    } else {
      thrallConfig.dir = path.resolve(thrallConfig.dir);
    }

    if (!thrallConfig.basePath) {
      throw new Error('Thall is missing a basePath.');
    } else {
      thrallConfig.basePath = path.resolve(thrallConfig.basePath);
    }
  }

  function getPackage() {
    if (thrallConfig.pkg) {
      return;
    }

    try {
      thrallConfig.pkg = require(
        path.join(thrallConfig.basePath, 'package.json')
      );
    } catch (e) {
      throw new Error('Thall is missing a pkg (package.json).');
    }
  }

  function setName() {
    if (!thrallConfig.name) {
      thrallConfig.name = thrallConfig.pkg.name;
    }
  }

  function loadConfig() {
    var userConfig = grunt.config(thrallConfig.name) || {};
    if (userConfig._) {
      delete userConfig._; /* remove protected stuff */
    }
    var defaults = {};
    var mergedCallback = function() {};

    if (thrallConfig.defaults) {
      defaults = baseInjector.createChild([{
        merged: ['value', function(cb) {
          mergedCallback = cb;
        }]
      }]).invoke(thrallConfig.defaults);
    }

    var mergedConfig = _.merge(
      defaults,
      userConfig
    );

    mergedCallback(mergedConfig);

    grunt.config.set(thrallConfig.name, mergedConfig);
  }

  return function init() {
    normalizePaths();
    getPackage();
    setName();

    loadConfig();
    registerSubtasks();
    addTasks();
  };
};
