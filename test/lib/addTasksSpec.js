describe('add tasks', function() { // jshint ignore: line
  'use strict';

  var proxyquire = require('proxyquire');
  var di = require('di');
  var path = require('path');
  var validThrallConfig;
  var fakeGrunt;
  var config;
  var taskFactory;
  var fakeGlob;
  var taskConfig;
  var taskConfigFactory;
  var fakeRunningTasks;

  function getAddTasks(proxyquireConfig) {
    return getInjector().invoke(proxyquire(
      lib('addTasks'),
      proxyquireConfig || {}
    ));
  }

  function getInjector() {
    return new di.Injector([{
      task: ['value', taskFactory],
      baseInjector: ['value', new di.Injector([])],
      thrallConfig: ['value', validThrallConfig],
      path: ['value', path],
      grunt: ['value', fakeGrunt],
      glob: ['value', fakeGlob],
      runningTasks: ['value', fakeRunningTasks],
      _: ['value', require('lodash')]
    }]);
  }

  beforeEach(function() {
    fakeRunningTasks = {
      get: function() { return []; }
    };
    fakeGlob = {
      sync: function() {}
    };
    taskFactory = function() {};
    config = {
      tasks: ['bar']
    };
    validThrallConfig = {
      name: 'foo',
      dir: './',
    };
    fakeGrunt = {
      config: function() {}
    };
    fakeGrunt.config.get = function(key) {
      if (key === 'foo.tasks') {
        return config.tasks;
      }
    };
    taskConfigFactory = function() {
      return taskConfig;
    };
    taskConfigFactory['@noCallThru'] = true;
    taskConfig = {};
  });

  it('should export a factory', function() {
    expect(require(lib('addTasks'))).to.be.instanceof(Function);
  });

  it('should provide a function', function() {
    expect(getAddTasks()).to.be.instanceof(Function);
  });

  it('should throw an error if task-file is not available', function() {
    var addTasks = getAddTasks({
      'tasks/bar': null
    });

    expect(function() {
      addTasks();
    }).to.throw(Error);
  });

  it('should allow a single task as string', function() {
    config.tasks = 'bar';
    var addTasks = getAddTasks({
      'tasks/bar': taskConfigFactory
    });

    expect(function() {
      addTasks();
    }).not.to.throw(Error);
  });

  it('should allow multiple tasks', function() {
    config.tasks = ['bar', 'baz'];
    var names = [];
    taskFactory = function(name) {
      names.push(name);
    };
    var addTasks = getAddTasks({
      'tasks/bar': taskConfigFactory,
      'tasks/baz': taskConfigFactory,
    });

    addTasks();
    expect(names).to.have.members(config.tasks);
  });

  it('should be callable with a specific task', function(done) {
    var taskName = 'foobar';
    taskFactory = function(name) {
      expect(name).to.equal(taskName);
      done();
    };
    getAddTasks({
      'tasks/foobar': taskConfigFactory,
    })([taskName]);
  });

  it('should not initiate the same task twice', function() {
    var taskName = 'barfoos';
    var names = [];
    taskFactory = function(name) {
      names.push(name);
    };

    var addTasks = getAddTasks({
      'tasks/barfoos': taskConfigFactory,
    });

    addTasks([taskName]);
    addTasks([taskName]);

    expect(names).to.deep.equal([taskName]);
  });

  it('should invoke taskFactory with loaded config', function(done) {
    taskFactory = function(name, config) {
      expect(name).to.equal('bar');
      expect(config).to.equal(taskConfig);
      done();
    };

    getAddTasks({
      'tasks/bar': taskConfigFactory
    })();
  });

  it('should provide the rootTask to taskConfig', function(done) {
    var someRunningTask = 'foo:hase';
    fakeRunningTasks.get = function() { return [someRunningTask, 'tue:tue']; };
    taskFactory = function(rootTask) {
      expect(rootTask).to.equal(someRunningTask);
      done();
    };

    getAddTasks({
      'tasks/bar': taskConfigFactory
    })();
  });

  it('should provide values from given child module', function(done) {
    var ipsum = {};
    validThrallConfig.module = {
      lorem: ['value', ipsum]
    };

    taskFactory = function(lorem) {
      expect(lorem).to.equal(ipsum);
      done();
    };

    getAddTasks({
      'tasks/bar': taskConfigFactory
    })();
  });

  describe('without configured tasks', function() {
    beforeEach(function() {
      config.tasks = undefined;
    });

    it('should find all tasks in taskDir', function() {
      var taskFiles = ['tasks/to/yo.js', 'tasks/lo.js'];
      var names = [];
      sinon.stub(fakeGlob, 'sync').returns(taskFiles);
      taskFactory = function(name) {
        names.push(name);
      };
      getAddTasks({
        'tasks/to/yo': taskConfigFactory,
        'tasks/lo': taskConfigFactory,
      })();
      expect(fakeGlob.sync).to.have.been.called;
      expect(names).to.have.members(['to:yo', 'lo']);
    });
  });

});
