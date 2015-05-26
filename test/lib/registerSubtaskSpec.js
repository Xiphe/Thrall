describe('register subtasks', function() {
  'use strict';

  var di = require('di');
  var proxyquire = require('proxyquire');
  var path = require('path');
  var validThrallConfig;
  var fakeFindupSync;
  var fakeGrunt;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      path: ['value', path],
      findupSync: ['value', fakeFindupSync],
      grunt: ['value', fakeGrunt],
      _: ['value', require('lodash')]
    }]);
  }

  function getRegisterSubtask(proxyquireConfig) {
    return getInjector().invoke(proxyquire(
      lib('registerSubtasks'),
      proxyquireConfig || {}
    ));
  }

  beforeEach(function() {
    fakeGrunt = {
      verbose: {
        subhead: function() { return fakeGrunt.verbose; },
        writeln: function() { return fakeGrunt.verbose; },
        write: function() { return fakeGrunt.verbose; }
      },
      loadTasks: function() {}
    };
    fakeFindupSync = function() {};
    validThrallConfig = {
      basePath: './',
      pkg: {
        dependencies: []
      }
    };
  });

  it('should export a function', function() {
    expect(require(lib('registerSubtasks'))).to.be.instanceof(Function);
  });

  it('should provide a function', function() {
    expect(getRegisterSubtask()).to.be.instanceof(Function);
  });

  it('should load tasks from package', function() {
    var tasksDir = 'foo/task';
    fakeFindupSync = sinon.stub().returns(tasksDir);
    sinon.stub(fakeGrunt, 'loadTasks');
    validThrallConfig.pkg.dependencies = {
      'grunt-foo': '0.1',
      'grunt-bar': '2.1'
    };

    getRegisterSubtask()();

    expect(fakeGrunt.loadTasks).to.have.been.calledWith(tasksDir);
    expect(fakeGrunt.loadTasks.callCount).to.equal(2);
  });

  it('should load devDependencies if told so', function() {
    var tasksDir = 'foo/task';
    fakeFindupSync = sinon.stub().returns(tasksDir);
    sinon.stub(fakeGrunt, 'loadTasks');
    validThrallConfig.loadDev = true;
    validThrallConfig.pkg.devDependencies = {
      'grunt-foo': '0.1',
      'grunt-bar': '2.1'
    };

    getRegisterSubtask()();

    expect(fakeGrunt.loadTasks).to.have.been.calledWith(tasksDir);
    expect(fakeGrunt.loadTasks.callCount).to.equal(2);
  });

  it('should not import non-grunt tasks', function() {
    fakeFindupSync = sinon.stub();
    validThrallConfig.pkg.dependencies = {
      'foo': '0.1'
    };
    getRegisterSubtask()();
    expect(fakeFindupSync).not.to.have.been.called;
  });

  it('should continue if no tasks directory is present', function() {
    fakeFindupSync = sinon.stub().returns(undefined);
    sinon.stub(fakeGrunt, 'loadTasks');
    validThrallConfig.pkg.dependencies = {
      'grunt-foo': '0.1'
    };

    getRegisterSubtask()();
    expect(fakeGrunt.loadTasks).not.to.have.been.called;
  });
});
