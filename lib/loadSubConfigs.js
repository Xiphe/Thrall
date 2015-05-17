module.exports = function(thrallConfig, path, grunt, _, getobject) {
  'use strict';

  /** @const */
  var SUBTASKS_DIR = 'subtasks';

  var loadedConfigs = [];

  function getNestedTasks(tokens, subconfig, injector) {
    if (tokens.indexOf('concurrent') !== -1 ||
      tokens.indexOf('watch') !== -1
    ) {
      if (_.isArray(subconfig)) {
        loadSubConfigs(subconfig, injector);
      } else {
        loadSubConfigs(subconfig.tasks, injector);
      }
    }
  }

  function getSubConfig(tokens, injector) {
    var subConfigPath = path.join.apply(
      path,
      [thrallConfig.dir, SUBTASKS_DIR].concat(tokens)
    );

    try {
      var config = injector.invoke(require(subConfigPath));
      getNestedTasks(tokens, config, injector);

      var configWithPath = {};
      getobject.set(
        configWithPath,
        tokens.join('.'),
        config
      );
      return configWithPath;
    } catch (e) {
      if (tokens.length > 1) {
        grunt.verbose.warn(
          'Cannot find config file for "' + tokens.join(':') + '"...' +
          ' trying to load parent.'
        );
        tokens.pop();
        return getSubConfig(tokens, injector);
      } else {
        e.subConfigPath = subConfigPath;
        throw e;
      }
    }
  }

  function loadSubConfig(taskName, injector) {
    var tokens = taskName.split(':');
    var config = {};

    try {
      config = getSubConfig(tokens, injector);
    } catch (e) {
      throw new Error(
        'No configuration found for subtask "' + taskName + '" or ' +
        'invalid configuration.\n' +
        'Expected at least "' + e.subConfigPath + '.js" to be valid, ' +
        'got: \n' + e
      );
    }
    grunt.config.merge(config);
  }

  /**
   * - Get a taskName like 'foo:bar'
   * - Search for subtasks/foo/bar.js
   * - invoke exported factory
   *
   * @param  {Array}  tasks
   * @param  {Object} injector
   * @return {void}
   */
  function loadSubConfigs(tasks, injector) {
    tasks.forEach(function(taskName) {
      if (loadedConfigs.indexOf(taskName) !== -1) {
        return; /* already loaded */
      }

      loadSubConfig(taskName, injector);

      loadedConfigs.push(taskName);
    });
  }

  return loadSubConfigs;
};
