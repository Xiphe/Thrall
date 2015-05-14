var di = require('di');

module.exports = function injectorFactory(grunt) {
  'use strict';

  return new di.Injector([{
    _: ['value', require('lodash')],
    findupSync: ['value', require('findup-sync')],
    fs: ['value', require('fs')],
    grunt: ['value', grunt],
    glob: ['value', require('glob')],
    path: ['value', require('path')]
  }]);
};
