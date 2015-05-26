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
        dir: '.tmp/coverage/reports/',
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
    },
    codeclimate: {
      options: {
        file: '<%= makeReport.options.dir %>lcov.info',
        token: process.env.THRALL_CODE_CLIMATE_TOKEN
      }
    },
    shell: {
      testSampleProject: {
        command: [
          'cd ' + __dirname + '/sample_project',
          'npm install',
          '../node_modules/.bin/grunt test'
        ].join(' && ')
      }
    },
    bump: {
      options: {
        pushTo: 'origin'
      }
    },
    'npm-publish': {
      options: {
        requires: ['test', 'shell:testSampleProject'],
        abortIfDirty: true
      }
    }
  });
}

function registerTestTasks(grunt) {
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

function registerReleaseTask(grunt) {
  grunt.registerTask('release', function() {
    grunt.task.run([
      'jshint',
      'jscs',
      'test',
      'shell:testSampleProject',
      'bump',
      'npm-publish'
    ]);
  });
}

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  initConfig(grunt);
  registerTestTasks(grunt);
  registerReleaseTask(grunt);
};
