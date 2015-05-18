describe('task', function() { // jshint ignore: line
  'use strict';

  var di = require('di');
  var validThrallConfig;
  var fakeGrunt;
  var fakeLoadSubConfigs;
  var taskConfig;
  var fakeApplyTaskOptions;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      grunt: ['value', fakeGrunt],
      loadSubConfigs: ['value', fakeLoadSubConfigs],
      applyTaskOptions: ['value', fakeApplyTaskOptions],
      _: ['value', require('lodash')]
    }]);
  }

  function getTask() {
    return getInjector().invoke(require(lib('task')));
  }

  beforeEach(function() {
    taskConfig = {
      run: ['foo:bar']
    };
    fakeApplyTaskOptions = function() {};
    fakeLoadSubConfigs = function() {};
    validThrallConfig = {};
    fakeGrunt = {
      config: function() {},
      verbose: {
        subhead: function() { return fakeGrunt.verbose; },
        writeln: function() { return fakeGrunt.verbose; },
        write: function() { return fakeGrunt.verbose; }
      },
      registerTask: sinon.spy(),
      task: {
        run: sinon.spy()
      }
    };
  });

  it('should export a factory', function() {
    expect(require(lib('task'))).to.be.instanceof(Function);
  });

  it('should provide a function', function() {
    expect(getTask()).to.be.instanceof(Function);
  });

  it('should load subConfigs', function() {
    fakeLoadSubConfigs = sinon.spy();
    getTask()('lorem', taskConfig);
    expect(fakeLoadSubConfigs).to.have.been.called;
  });

  it('should register the task with description', function() {
    var name = 'hase';
    taskConfig.description = 'rennt schnell';
    getTask()(name, taskConfig);
    expect(fakeGrunt.registerTask).to.have.been.calledWith(
      name,
      taskConfig.description
    );
  });

  it('should join description if given as array', function() {
    var name = 'hase';
    taskConfig.description = ['rennt', 'schnell'];
    getTask()(name, taskConfig);
    expect(fakeGrunt.registerTask).to.have.been.calledWith(
      name,
      'rennt\nschnell'
    );
  });

  it('should take name from config if available', function() {
    var name = 'dackel';
    taskConfig.name = name;
    getTask()('hase', taskConfig);
    expect(fakeGrunt.registerTask).to.have.been.calledWith(
      name
    );
  });

  it('should register hooks', function() {
    var name = 'igel';
    getTask()(name, taskConfig);
    expect(fakeGrunt.registerTask).to.have.been.calledWith(
      name + ':before'
    );
    expect(fakeGrunt.registerTask).to.have.been.calledWith(
      name + ':after'
    );
  });

  it('should run subtasks when task is executed', function() {
    getTask()('fuchs', taskConfig);
    fakeGrunt.registerTask.getCall(2).args[2]();
    expect(fakeGrunt.task.run).to.have.been.calledWith([
      'fuchs:before',
      'foo:bar',
      'fuchs:after'
    ]);
  });

  it('should apply CLI options before configuring subtasks', function() {
    var callOrder = [];
    fakeApplyTaskOptions = function() {
      callOrder.push('applyTaskOptions');
    };
    fakeLoadSubConfigs = function() {
      callOrder.push('loadSubConfigs');
    };
    getTask()('fuchs', taskConfig);
    expect(callOrder).to.deep.equal(['applyTaskOptions', 'loadSubConfigs']);
  });

  it('should include or exclude tasks base on config', function() {
    var config = {
      'run.bc': true,
      'run.d': false
    };
    fakeGrunt.config = function(key) {
      return config[key];
    };
    taskConfig = {
      run: [
        'foo:bar',
        {task: 'a'},
        {if: 'run.bc', task: ['b', 'c']},
        {if: 'run.d', task: 'd'},
        {if: 'run.e', task: 'e', else: 'f'},
      ]
    };
    getTask()('fuchs', taskConfig);
    fakeGrunt.registerTask.getCall(2).args[2]();
    expect(fakeGrunt.task.run).to.have.been.calledWith([
      'fuchs:before',
      'foo:bar',
      'a',
      'b',
      'c',
      'f',
      'fuchs:after',
    ]);
  });
});
