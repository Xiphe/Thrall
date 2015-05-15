module.exports = function(thrallConfig, path, grunt, _) {
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

      var config = {};
      var subconfig = config;
      var tokens = taskName.split(':');
      var subtaskPath = path.join(thrallConfig.dir, SUBTASKS_DIR);
      tokens.forEach(function(token, i) {
        subtaskPath = path.join(subtaskPath, token);
        if (i + 1 < tokens.length) {
          subconfig[token] = {};
        } else {
          try {
            subconfig[token] = injector.invoke(require(subtaskPath));
          } catch (e) {
            throw new Error(
              'No configuration found for subtask "' + taskName + '" or ' +
              'invalid configuration.\n' +
              'Expected "' + subtaskPath + '.js" to be valid, got: \n' +
              e
            );
          }
        }
        subconfig = subconfig[token];
      });

      getNestedTasks(tokens, subconfig, injector);
      loadedConfigs.push(taskName);
      grunt.config.merge(config);
    });
  }

  return loadSubConfigs;
};
