describe('task', function() { // jshint ignore: line
  'use strict';

  var di = require('di');
  var validThrallConfig;
  var fakeGrunt;
  var fakeLoadSubConfigs;
  var taskConfig;
  var fakeCliOptions;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      grunt: ['value', fakeGrunt],
      loadSubConfigs: ['value', fakeLoadSubConfigs],
      cliOptions: ['value', fakeCliOptions],
      _: ['value', require('lodash')]
    }]);
  }

  function getTask() {
    return getInjector().invoke(require(lib('task')));
  }

  beforeEach(function() {
    fakeCliOptions = {};
    taskConfig = {
      run: ['foo:bar']
    };
    fakeLoadSubConfigs = function() {};
    validThrallConfig = {};
    fakeGrunt = {
      config: {
        set: function() {}
      },
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

  it('should apply environment variables if configured', function() {
    sinon.spy(fakeGrunt.config, 'set');
    var previousFoo = process.env.FOO;
    var FOO_VAR = 'hase';
    process.env.FOO = FOO_VAR;
    taskConfig.env = {
      FOO: 'foo.bar'
    };
    getTask()('fuchs', taskConfig);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      'foo.bar',
      FOO_VAR
    );
    process.env.FOO = previousFoo;
  });

  it('should not apply undefined environment variables', function() {
    sinon.spy(fakeGrunt.config, 'set');
    var previousFoo = process.env.FOO;
    delete process.env.FOO;
    taskConfig.env = {
      FOO: 'foo.bar'
    };
    getTask()('fuchs', taskConfig);
    expect(fakeGrunt.config.set).not.to.have.been.called;
    process.env.FOO = previousFoo;
  });

  it('should apply CLI options if configured', function() {
    sinon.spy(fakeGrunt.config, 'set');
    var barOption = 'igel';
    var configPath = 'foo.bar';
    taskConfig.options = {
      bar: configPath
    };
    fakeCliOptions.bar = barOption;
    getTask()('fuchs', taskConfig);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      barOption
    );
  });

  it('should not apply undefined CLI options', function() {
    sinon.spy(fakeGrunt.config, 'set');
    var configPath = 'foo.bar';
    taskConfig.options = {
      bar: configPath
    };
    getTask()('fuchs', taskConfig);
    expect(fakeGrunt.config.set).not.to.have.been.called;
  });
});
