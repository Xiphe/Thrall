module.exports = function taskFactory(
  thrallConfig,
  grunt,
  loadSubConfigs,
  applyTaskOptions,
  _,
  runningTasks
) {
  'use strict';

  function registerHooks(name) {
    ['before', 'after'].forEach(function(hook) {
      grunt.registerTask(name + ':' + hook, 'overwrite this *', []);
    });
  }

  function addHooks(name, run) {
    run.unshift(name + ':before');
    run.push(name + ':after');
  }

  function normalizeDescription(description) {
    if (_.isArray(description)) {
      description = description.join('\n');
    }
    return description;
  }

  function getUse(conditions) {
    var use = true;
    if (!_.isArray(conditions)) {
      conditions = [conditions];
    }

    conditions.forEach(function(condition) {
      if (!use || _.isUndefined(condition)) {
        return;
      }
      if (_.isBoolean(condition)) {
        use = condition;
      } else {
        use = grunt.config(condition);
      }
    });

    return use;
  }

  function processRunIf(runTasks) {
    var tasks = [];

    runTasks.forEach(function(task) {
      if (_.isObject(task)) {
        var use = getUse(task.if);

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
    registerHooks(name, config.run);

    grunt.registerTask(
      name,
      normalizeDescription(config.description),
      function() {
        var run = config.run;
        if (_.isFunction(config.runFilter)) {
          run = config.runFilter(run, arguments);
        }
        addHooks(name, run);
        runningTasks.push(name);
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
