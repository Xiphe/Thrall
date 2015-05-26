module.exports = function() {
  'use strict';

  return {
    all: {
      options: {
        singleRun: true,
        frameworks: ['jasmine'],
        files: [
          'src/*.js',
          'test/*.js'
        ],
        browsers: ['Firefox']
      }
    }
  };
};
