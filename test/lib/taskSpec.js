describe('task', function() { // jshint ignore: line
  'use strict';

  var di = require('di');
  var validThrallConfig;
  var fakeGrunt;
  var fakeMergeGruntPluginConfig;
  var taskConfig;
  var fakeApplyTaskOptions;
  var fakeRunningTasks;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      grunt: ['value', fakeGrunt],
      mergeGruntPluginConfig: ['value', fakeMergeGruntPluginConfig],
      runningTasks: ['value', fakeRunningTasks],
      applyTaskOptions: ['value', fakeApplyTaskOptions],
      _: ['value', require('lodash')]
    }]);
  }

  function getTask() {
    return getInjector().invoke(require(lib('task')));
  }

  beforeEach(function() {
    fakeRunningTasks = {
      push: function() {}
    };
    taskConfig = {
      run: ['foo:bar']
    };
    fakeApplyTaskOptions = function() {};
    fakeMergeGruntPluginConfig = function() {};
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
    fakeMergeGruntPluginConfig = sinon.spy();
    getTask()('lorem', taskConfig);
    expect(fakeMergeGruntPluginConfig).to.have.been.called;
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

  it('should the push a task to runningTasks when executed', function() {
    sinon.spy(fakeRunningTasks, 'push');
    getTask()('fuchs', taskConfig);
    fakeGrunt.registerTask.getCall(2).args[2]();
    expect(fakeRunningTasks.push).to.have.been.calledWith('fuchs');
  });

  it('should apply CLI options before configuring subtasks', function() {
    var callOrder = [];
    fakeApplyTaskOptions = function() {
      callOrder.push('applyTaskOptions');
    };
    fakeMergeGruntPluginConfig = function() {
      callOrder.push('mergeGruntPluginConfig');
    };
    getTask()('fuchs', taskConfig);
    expect(callOrder).to.deep.equal([
      'applyTaskOptions',
      'mergeGruntPluginConfig'
    ]);
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

  it('should allow array of ifs in runIf', function() {
    var config = {
      'run.a': true,
      'run.b': false,
      'run.c': true,
    };
    fakeGrunt.config = function(key) {
      return config[key];
    };
    taskConfig = {
      run: [
        {if: ['run.a', 'run.b'], task: ['a']},
        {if: ['run.a', 'run.c'], task: ['b']},
        {if: ['run.b', 'run.c'], task: ['d']}
      ]
    };
    getTask()('fuchs', taskConfig);
    fakeGrunt.registerTask.getCall(2).args[2]();
    expect(fakeGrunt.task.run).to.have.been.calledWith([
      'fuchs:before',
      'b',
      'fuchs:after',
    ]);
  });

  it('should allow booleans for runIf blocks', function() {
    taskConfig = {
      run: [
        {if: true, task: ['a']},
        {if: [true, false], task: ['b']},
        {if: false, task: ['d']}
      ]
    };
    getTask()('fuchs', taskConfig);
    fakeGrunt.registerTask.getCall(2).args[2]();
    expect(fakeGrunt.task.run).to.have.been.calledWith([
      'fuchs:before',
      'a',
      'fuchs:after',
    ]);
  });

  it('should pass subtasks through runFilter if present', function() {
    taskConfig = {
      run: ['b', 'c'],
      runFilter: function(tasks, args) {
        expect(args[0]).to.equal('bar');
        tasks.unshift('a');
        tasks.push('d');
        return tasks;
      }
    };
    getTask()('foo', taskConfig);
    fakeGrunt.registerTask.getCall(2).args[2]('bar');
    expect(fakeGrunt.task.run).to.have.been.calledWith([
      'foo:before',
      'a',
      'b',
      'c',
      'd',
      'foo:after',
    ]);
  });
});
