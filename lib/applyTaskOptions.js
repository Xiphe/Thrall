module.exports = function(_, grunt, cliOptions) {
  'use strict';

  /** @const */
  var OPTION_TYPE_ARRAY = 'array';

  function getOptionValue(optionNames) {
    var value;

    optionNames.forEach(function(optionName) {
      if (!optionName) {
        return;
      }

      if (_.isUndefined(value) && !_.isUndefined(cliOptions[optionName])) {
        value = cliOptions[optionName];
      }
    });

    return value;
  }

  function normalize(option) {
    if (!_.isObject(option)) {
      option = {
        key: option
      };
    }
    return option;
  }

  function convertValue(value, type) {
    if (type === OPTION_TYPE_ARRAY && _.isString(value)) {
      return value.split(',');
    }

    return value;
  }

  function getEnvValue(key) {
    if (!key) {
      return;
    }

    return process.env[key];
  }

  function applyOption(option, optionName) {
    option = normalize(option, optionName);

    var value = getOptionValue([optionName].concat(option.alias));

    if (_.isUndefined(value)) {
      value = getEnvValue(option.env);
    }

    if (_.isUndefined(value)) {
      return;
    }

    value = convertValue(value, option.type);

    grunt.config.set(option.key, value);
  }

  return function applyOptions(options) {
    if (!_.isObject(options)) { return; }

    _.forEach(options, applyOption);
  };
};
