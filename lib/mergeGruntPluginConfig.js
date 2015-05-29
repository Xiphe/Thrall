/* jshint ignore: line */module.exports = function(
  thrallConfig,
  path,
  grunt,
  glob,
  _,
  getobject,
  injector
) {
  'use strict';

  /** @const */
  var CONFIG_DIR = 'config/';

  /** @const */
  var CONFIG_IS_LOADED = {};

  var loadedConfigs = [];

  /* To prevent circular dependency between addTasks and
     mergeGruntPluginConfig, get addTasks after dependency initiation. */
  function getAddTasks() {
    if (!getAddTasks.addTasks) {
      getAddTasks.addTasks = injector.get('addTasks');
    }

    return getAddTasks.addTasks;
  }

  function getNestedTasks(tokens, subconfig, subtaskInjector) {
    if (tokens.indexOf('concurrent') !== -1 ||
      tokens.indexOf('watch') !== -1
    ) {
      if (_.isArray(subconfig)) {
        mergeGruntPluginConfig(subconfig, subtaskInjector);
      } else {
        mergeGruntPluginConfig(subconfig.tasks, subtaskInjector);
      }
    }
  }

  function mergeGruntConfig(config, key) {
    var gruntConfig = grunt.config.get(key);

    if (_.isObject(gruntConfig)) {
      _.merge(
        config,
        gruntConfig
      );
    } else if (_.isUndefined(gruntConfig)) {
      return config;
    } else {
      config = gruntConfig;
    }

    return config;
  }

  function loadSubConfig(tokens, configPath, subConfigPath, subtaskInjector) {
    var config = subtaskInjector.invoke(require(subConfigPath));
    getNestedTasks(tokens, config, subtaskInjector);

    config = mergeGruntConfig(config, configPath);

    var configWithPath = {};

    getobject.set(
      configWithPath,
      configPath,
      config
    );

    return configWithPath;
  }

  function getSubConfig(tokens, subtaskInjector) {
    var subConfigPath = path.join.apply(
      path,
      [thrallConfig.dir, CONFIG_DIR].concat(tokens)
    );

    try {
      var configPath = tokens.join('.');
      if (loadedConfigs.indexOf(configPath) !== -1) {
        return CONFIG_IS_LOADED; /* already loaded */
      }

      var config = loadSubConfig(
        tokens,
        configPath,
        subConfigPath,
        subtaskInjector
      );

      loadedConfigs.push(configPath);

      return config;
    } catch (e) {
      if (tokens.length > 1) {
        grunt.verbose.warn(
          'Cannot find config file for "' + tokens.join(':') + '"...' +
          ' trying to load parent.\nGot: ' + e
        );
        tokens.pop();
        return getSubConfig(tokens, subtaskInjector);
      } else {
        e.subConfigPath = subConfigPath;
        throw e;
      }
    }
  }

  function isMainTask(taskName) {
    var taskGlob = path.join(
      thrallConfig.dir,
      getAddTasks().TASKS_DIR,
      taskName.replace(':', '/') + '.+(js|coffee)'
    );
    return !!glob.sync(taskGlob).length;
  }

  function mergeMaintask(taskName) {
    if (isMainTask(taskName)) {
      getAddTasks()([taskName]);
      return true;
    }

    return false;
  }

  function mergeRunIfBlock(taskName, subtaskInjector) {
    if (_.isObject(taskName)) {
      mergeGruntPluginConfig(
        [].concat(taskName.task).concat(taskName.else),
        subtaskInjector
      );
      return true;
    }

    return false;
  }

  function mergeSubConfig(taskName, subtaskInjector) {
    if (!taskName) {
      return;
    }

    if (mergeRunIfBlock(taskName, subtaskInjector)) {
      return;
    }

    if (mergeMaintask(taskName)) {
      return;
    }

    try {
      var subconfig = getSubConfig(
        taskName.split(':'),
        subtaskInjector
      );
      if (subconfig !== CONFIG_IS_LOADED) {
        grunt.config.merge(subconfig);
      }
    } catch (e) {
      throw new Error(
        'No configuration found for subtask "' + taskName + '" or ' +
        'invalid configuration.\n' +
        'Expected at least "' + e.subConfigPath + '.js" to be valid, ' +
        'got: \n' + e
      );
    }
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
  function mergeGruntPluginConfig(tasks, subtaskInjector) {
    tasks.forEach(function(taskName) {
      mergeSubConfig(taskName, subtaskInjector);
    });
  }

  return mergeGruntPluginConfig;
};
