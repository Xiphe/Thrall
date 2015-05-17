module.exports = function taskFactory(
  thrallConfig,
  grunt,
  loadSubConfigs,
  cliOptions,
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

  function applyEnv(env) {
    if (!env) { return; }
    _.forEach(env, function(configKey, envVar) {
      if (!_.isUndefined(process.env[envVar])) {
        grunt.config.set(configKey, process.env[envVar]);
      }
    });
  }

  function applyOptions(options) {
    if (!options) { return; }
    _.forEach(options, function(configKey, optionKey) {
      if (!_.isUndefined(cliOptions[optionKey])) {
        grunt.config.set(configKey, cliOptions[optionKey]);
      }
    });
  }

  function normalizeDescription(description) {
    if (_.isArray(description)) {
      description = description.join('\n');
    }
    return description;
  }

  return function task(name, config, injector) {
    if (config.name) {
      name = config.name;
    }

    grunt.verbose.subhead(
      'Registering task "' + name + '" for "' + thrallConfig.name + '"...'
    );

    loadSubConfigs(config.run, injector);
    applyEnv(config.env);
    applyOptions(config.options);
    addHooks(name, config.run);

    grunt.registerTask(
      name,
      normalizeDescription(config.description),
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
