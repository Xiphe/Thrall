module.exports = function(
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
  var SUBTASKS_DIR = 'subtasks';

  var loadedConfigs = [];

  /* To prevent circular dependency between addTasks and
     loadSubConfigs, get addTasks after dependency initiation. */
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
        loadSubConfigs(subconfig, subtaskInjector);
      } else {
        loadSubConfigs(subconfig.tasks, subtaskInjector);
      }
    }
  }

  function getSubConfig(tokens, subtaskInjector) {
    var subConfigPath = path.join.apply(
      path,
      [thrallConfig.dir, SUBTASKS_DIR].concat(tokens)
    );

    try {
      var config = subtaskInjector.invoke(require(subConfigPath));
      getNestedTasks(tokens, config, subtaskInjector);

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

  function loadSubConfig(taskName, subtaskInjector) {
    if (!taskName) { return; }

    if (_.isObject(taskName)) {
      loadSubConfigs(
        [].concat(taskName.task).concat(taskName.else),
        subtaskInjector
      );
      return;
    }

    if (isMainTask(taskName)) {
      getAddTasks()([taskName]);
      return;
    }

    try {
      grunt.config.merge(
        getSubConfig(
          taskName.split(':'),
          subtaskInjector
        )
      );
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
  function loadSubConfigs(tasks, subtaskInjector) {
    tasks.forEach(function(taskName) {
      if (loadedConfigs.indexOf(taskName) !== -1) {
        return; /* already loaded */
      }

      loadSubConfig(taskName, subtaskInjector);

      loadedConfigs.push(taskName);
    });
  }

  return loadSubConfigs;
};
