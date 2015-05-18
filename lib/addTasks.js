module.exports = function addTaskFactory(
  task,
  baseInjector,
  thrallConfig,
  grunt,
  glob,
  injector,
  _,
  path
) {
  'use strict';

  var TASKS_DIR = 'tasks';
  var childModule = thrallConfig.module || {};

  function getTasks() {
    var tasks = grunt.config.get(thrallConfig.name + '.tasks');

    if (!tasks) {
      var tasksDir = path.join(thrallConfig.dir, TASKS_DIR);
      var tasksGlob = path.join(tasksDir, '**/*.+(js|coffee)');
      tasks = glob.sync(tasksGlob)
        .map(function(taskFile) {
          return path.relative(tasksDir, taskFile)
            /* strip extension */
            .split('.').slice(0, -1).join('.')
            /* format for cli */
            .replace('/', ':');
        });
    } else if (!_.isArray(tasks)) {
      tasks = [tasks];
    }

    return tasks;
  }

  return function addTasks() {
    var tasks = getTasks();
    tasks.forEach(function(taskName) {
      var taskConfig;
      var taskConfigPath = path.join(
        thrallConfig.dir,
        TASKS_DIR,
        taskName.replace(':', '/')
      );
      try {
        taskConfig = require(taskConfigPath);
      } catch (e) {
        throw new Error(
          'No configuration found for task "' + taskName + '". ' +
          'Expected here: "' + taskConfigPath + '.js".'
        );
      }

      baseInjector.createChild([{
        name: ['value', taskName],
        config: ['factory', taskConfig]
      }, childModule]).invoke(task);
    });
  };
};
