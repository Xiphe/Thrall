module.exports = function getRunningTasksFactory(_, thrallConfig) {
  'use strict';

  var envKey = 'THRALL_RUNNING_TASKS_' + thrallConfig.name.toUpperCase();

  var runningTasks = {
    get: function() {
      if (_.isUndefined(process.env[envKey])) {
        process.env[envKey] = '';
      }

      return process.env[envKey].split(',').filter(function(task) {
        return !!task.length;
      });
    },
    push: function(task) {
      var tasks = runningTasks.get();
      tasks.push(task);
      process.env[envKey] = tasks.join(',');
    }
  };

  return runningTasks;
};
