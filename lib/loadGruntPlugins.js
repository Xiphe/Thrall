module.exports = function loadGruntPluginsFactory(
  thrallConfig,
  grunt,
  findupSync,
  path,
  _
) {
  'use strict';

  return function loadGruntPlugins() {
    grunt.verbose.subhead(
      'loading grunt plugins for "' + thrallConfig.name + '"...'
    );

    var deps = {};

    if (thrallConfig.loadDependencies) {
      _.merge(deps, thrallConfig.pkg.dependencies);
    }

    if (
      _.isUndefined(thrallConfig.loadDevDependencies) ||
      thrallConfig.loadDevDependencies
    ) {
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
      .write('Grunt plugins of "' + thrallConfig.name + '"...')
      .writeln('OK'.green)
      .writeln();
  };
};
