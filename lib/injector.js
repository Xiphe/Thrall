var di = require('di');

module.exports = function injectorFactory(grunt) {
  'use strict';

  return new di.Injector([{
    _: ['value', require('lodash')],
    cliOptions: ['factory', require('./cliOptions')],
    del: ['value', require('del')],
    findupSync: ['value', require('findup-sync')],
    fs: ['value', require('fs')],
    getobject: ['value', require('getobject')],
    glob: ['value', require('glob')],
    grunt: ['value', grunt],
    mkdirp: ['value', require('mkdirp')],
    path: ['value', require('path')]
  }]);
};
