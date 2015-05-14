module.exports = function(grunt) {
  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    env: {
      coverage: {
        COVERAGE_DIR: '.tmp/coverage/instrument/lib'
      }
    },
    instrument: {
      files: 'lib/*.js',
      options: {
        lazy: true,
        basePath: '.tmp/coverage/instrument/'
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: [
        'test/*.js',
        'test/lib/*.js'
      ]
    },
    storeCoverage: {
      options: {
        dir: '.tmp/coverage/reports'
      }
    },
    makeReport: {
      src: '.tmp/coverage/reports/**/*.json',
      options: {
        type: 'lcov',
        dir: '.tmp/coverage/reports',
        print: 'detail'
      }
    },
    watch: {
      test: {
        files: [
          '<%= instrument.files %>',
          '<%= mochaTest.src %>'
        ],
        tasks: ['_test'],
      }
    }
  });

  require('load-grunt-tasks')(grunt);

  grunt.registerTask('_test', [
    'env:coverage',
    'instrument',
    'mochaTest',
    'storeCoverage',
    'makeReport'
  ]);

  var testTasks = ['_test'];
  if (grunt.option('watch')) {
    testTasks.push('watch:test');
  }
  grunt.registerTask('test', testTasks);
};
