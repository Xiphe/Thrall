module.exports = function taskFactory(thrallConfig, grunt, loadSubConfigs, _) {
  'use strict';

  function addHooks(name, run) {
    ['before', 'after'].forEach(function(hook) {
      grunt.registerTask(name + ':' + hook, 'overwrite this *', []);
    });

    run.unshift(name + ':before');
    run.push(name + ':after');
  }

  return function task(name, config, injector) {
    if (config.name) {
      name = config.name;
    }

    grunt.verbose.subhead(
      'Registering task "' + name + '" for "' + thrallConfig.name + '"...'
    );

    var description = config.description;
    loadSubConfigs(config.run, injector);
    addHooks(name, config.run);

    if (_.isArray(description)) {
      description = description.join('\n');
    }

    grunt.registerTask(
      name,
      description,
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
