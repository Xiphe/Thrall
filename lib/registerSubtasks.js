module.exports = function registerSubtaskFactory(
  thrallConfig,
  grunt,
  findupSync,
  path,
  _
) {
  'use strict';

  return function registerSubtasks() {
    grunt.verbose.subhead(
      'Registering subtasks of "' + thrallConfig.name + '"...'
    );

    var deps = {};

    _.merge(deps, thrallConfig.pkg.dependencies);

    if (thrallConfig.loadDev) {
      _.merge(deps, thrallConfig.pkg.devDependencies);
    }

    _.forEach(deps, function(__, dep) {
      var tasksDir = false;
      if (dep.indexOf('grunt-') === 0) {
        var name = path.join('node_modules', dep, 'tasks');
        tasksDir = findupSync(name, {cwd: thrallConfig.basePath});
        if (tasksDir) {
          grunt.loadTasks(tasksDir);
        }
      }
    });

    grunt.verbose
      .writeln()
      .write('Subtasks of "' + thrallConfig.name + '"...')
      .writeln('OK'.green)
      .writeln();
  };
};
