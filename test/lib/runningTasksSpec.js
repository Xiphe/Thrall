describe('runningTasks', function() {
  'use strict';

  var envKey = 'THRALL_RUNNING_TASKS_FOOTEST';
  var runningTasks;
  var _ = require('lodash');

  beforeEach(function() {
    runningTasks = require(lib('runningTasks'))(_, {name: 'footest'});
  });

  afterEach(function() {
    delete process.env[envKey];
  });

  it('should export a factory', function() {
    expect(require(lib('runningTasks'))).to.be.instanceof(Function);
  });

  it('should provide an object', function() {
    expect(require(lib('runningTasks'))).to.be.instanceof(Object);
  });

  it('should provide a list for currently running tasks', function() {
    expect(runningTasks.get()).to.be.instanceof(Array);
    expect(runningTasks.get().length).to.equal(0);
  });

  it('should load list from environment', function() {
    process.env[envKey] = 'a,b,c';
    expect(runningTasks.get()).to.deep.equal(['a', 'b', 'c']);
  });

  it('should push tasks to list', function() {
    runningTasks.push('foo:bar');
    expect(process.env[envKey]).to.equal('foo:bar');
  });
});
