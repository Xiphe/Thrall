'use strict';

var sinon = require('sinon'); // jshint ignore: line
var chai = require('chai');
var path = require('path');
var base = process.cwd();

global.expect = chai.expect;
global.sinon = sinon;
global.should = chai.should();
global.lib = function(file) {
  return path.join(
    base,
    process.env.COVERAGE_DIR || 'lib',
    file
  );
};

chai.use(require('chai-as-promised'));
chai.use(require('sinon-chai'));

beforeEach(function() {
  global.sinon = sinon.sandbox.create();
});

afterEach(function() {
  sinon.restore();
});
