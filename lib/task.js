module.exports = function taskFactory(thrallConfig, grunt, loadSubConfigs) {
  'use strict';

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
