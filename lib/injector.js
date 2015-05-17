var di = require('di');

module.exports = function injectorFactory(grunt) {
  'use strict';

  return new di.Injector([{
    _: ['value', require('lodash')],
    cliOptions: ['factory', require('./cliOptions')],
    findupSync: ['value', require('findup-sync')],
    fs: ['value', require('fs')],
    getobject: ['value', require('getobject')],
    glob: ['value', require('glob')],
    grunt: ['value', grunt],
    path: ['value', require('path')]
  }]);
};
