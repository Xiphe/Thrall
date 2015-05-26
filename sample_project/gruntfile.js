module.exports = function(grunt) {
  'use strict';

  require('../lib/index').init({
    name: 'sampleProject',
    dir: __dirname + '/grunt',
    grunt: grunt,
    basePath: __dirname,
    module: {
      karmaTask: ['value', 'karma:all']
    },
    getDefaults: function() {
      return {};
    }
  });

  grunt.registerTask('test:after', function() {
    grunt.log.writeln('Lok\'tar, friend.'.green);
  });
};
