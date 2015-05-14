module.exports = function taskFactory(thrallConfig, grunt, path, _) {
  'use strict';

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

  function addHooks(name, run) {
    ['before', 'after'].forEach(function(hook) {
      grunt.registerTask(name + ':' + hook, 'overwrite this *', []);
    });

    run.unshift(name + ':before');
    run.push(name + ':after');
  }

  return function task(name, config, injector) {
    grunt.verbose.subhead(
      'Registering task "' + name + '" for "' + thrallConfig.name + '"...'
    );

    loadSubConfigs(config.run, injector);
    addHooks(name, config.run);
    grunt.registerTask(
      name,
      (config.description || []).join('\n'),
      function() {
        grunt.task.run(config.run);
      }
    );

    grunt.verbose
      .writeln()
      .write('Task "' + name + '"...')
      .writeln('OK'.green)
      .writeln();
  };
};
