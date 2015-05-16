describe('task', function() {
  'use strict';

  var di = require('di');
  var validThrallConfig;
  var fakeGrunt;
  var fakeLoadSubConfigs;
  var taskConfig;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      grunt: ['value', fakeGrunt],
      loadSubConfigs: ['value', fakeLoadSubConfigs],
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
    fakeLoadSubConfigs = function() {};
    validThrallConfig = {};
    fakeGrunt = {
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
});