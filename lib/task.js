module.exports = function taskFactory(
  thrallConfig,
  grunt,
  loadSubConfigs,
  applyTaskOptions,
  _
) {
  'use strict';

  function addHooks(name, run) {
    ['before', 'after'].forEach(function(hook) {
      grunt.registerTask(name + ':' + hook, 'overwrite this *', []);
    });

    run.unshift(name + ':before');
    run.push(name + ':after');
  }

  function normalizeDescription(description) {
    if (_.isArray(description)) {
      description = description.join('\n');
    }
    return description;
  }

  function processRunIf(runTasks) {
    var tasks = [];

    runTasks.forEach(function(task) {
      if (_.isObject(task)) {
        var use = true;

        if (task.if) {
          use = grunt.config(task.if);
        }

        if (use) {
          tasks = tasks.concat(task.task);
        } else if (task.else) {
          tasks = tasks.concat(task.else);
        }
      } else {
        tasks.push(task);
      }
    });

    return tasks;
  }

  return function task(name, config, injector) {
    grunt.verbose.subhead(
      'Registering task "' + name + '" for "' + thrallConfig.name + '"...'
    );

    applyTaskOptions(config.options);
    loadSubConfigs(config.run, injector);
    addHooks(name, config.run);

    grunt.registerTask(
      name,
      normalizeDescription(config.description),
      function() {
        grunt.task.run(processRunIf(config.run));
      }
    );

    grunt.verbose
      .writeln()
      .write('Task "' + name + '"...')
      .writeln('OK'.green)
      .writeln();
  };
};
