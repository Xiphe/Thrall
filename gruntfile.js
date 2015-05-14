'use strict';

function initConfig(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    srcFiles: 'lib/*.js',
    testFiles: [
      'test/*.js',
      'test/lib/*.js'
    ],
    env: {
      coverage: {
        COVERAGE_DIR: '.tmp/coverage/instrument/lib'
      }
    },
    instrument: {
      files: '<%= srcFiles %>',
      options: {
        lazy: true,
        basePath: '.tmp/coverage/instrument/'
      }
    },
    mochaTest: {
      options: {
        reporter: 'spec'
      },
      src: '<%= testFiles %>'
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
          '<%= srcFiles %>',
          '<%= testFiles %>'
        ],
        tasks: ['run-tests'],
      }
    },
    jscs: {
      src: [
        '<%= srcFiles %>',
        '<%= testFiles %>',
        'gruntfile.js',
      ]
    },
    jshint: {
      options: {
        jshintrc: true
      },
      src: '<%= jscs.src %>'
    }
  });
}

function registerTasks(grunt) {
  var argv = require('minimist')(process.argv.slice(2));

  var runTestTask = [];
  if (argv.all) {
    runTestTask.push('jshint', 'jscs');
  }
  runTestTask.push(
    'env:coverage',
    'instrument',
    'mochaTest',
    'storeCoverage',
    'makeReport'
  );
  grunt.registerTask('run-tests', runTestTask);

  var testTask = ['run-tests'];
  if (argv.watch) {
    testTask.push('watch:test');
  }
  grunt.registerTask('test', testTask);
}

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  initConfig(grunt);
  registerTasks(grunt);
};
