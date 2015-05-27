describe('apply task options', function() { // jshint ignore: line
  'use strict';

  var di = require('di');
  var fakeGrunt;
  var fakeCliOptions;

  function getInjector() {
    return new di.Injector([{
      _: ['value', require('lodash')],
      grunt: ['value', fakeGrunt],
      cliOptions: ['value', fakeCliOptions],
    }]);
  }

  function getApplyTaskOptions() {
    return getInjector().invoke(require(lib('applyTaskOptions')));
  }

  beforeEach(function() {
    fakeCliOptions = {
      _: ['']
    };
    fakeGrunt = {
      config: {
        set: sinon.spy()
      }
    };
  });

  it('should export a factory', function() {
    expect(require(lib('applyTaskOptions'))).to.be.instanceof(Function);
  });

  it('should do nothing without options', function() {
    getApplyTaskOptions()();
    expect(fakeGrunt.config.set).not.to.have.been.called;
  });

  it('should apply CLI options if configured', function() {
    var barOption = 'igel';
    var configPath = 'foo.bar';
    var options = {
      bar: configPath
    };
    fakeCliOptions.bar = barOption;
    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      barOption
    );
  });

  it('should allow aliases', function() {
    var barOption = 'hase';
    var configPath = 'foo.bar';
    var options = {
      bar: {
        alias: 'foo',
        key: configPath
      }
    };
    fakeCliOptions.foo = barOption;

    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      barOption
    );
  });

  it('should not set undefined options', function() {
    var options = {
      foo: 'lorem.ipsum'
    };
    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).not.to.have.been.called;
  });

  it('should convert strings to arrays', function() {
    var configPath = 'foo.bar';
    var options = {
      bar: {
        type: 'array',
        key: configPath
      }
    };
    fakeCliOptions.bar = 'hase,igel';

    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      ['hase', 'igel']
    );
  });

  it('should not convert non-strings to arrays', function() {
    var configPath = 'foo.bar';
    var options = {
      bar: {
        type: 'array',
        key: configPath
      }
    };
    fakeCliOptions.bar = false;

    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      false
    );
  });

  it('should set environment variables if configured', function() {
    var fooOriginal = process.env.FOO;
    var configPath = 'yo.lo';
    var fooValue = 'fuchs';
    process.env.FOO = fooValue;
    var options = {
      bar: {
        env: 'FOO',
        key: configPath
      }
    };
    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      fooValue
    );
    process.env.FOO = fooOriginal;
  });

  it('should take gruntOptions if configured', function() {
    var configPath = 'foo.bar';
    fakeCliOptions._[0] = 'alles:etwas:doller';
    var options = {
      bar: {
        grunt: ':doller',
        key: configPath
      }
    };
    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).to.have.been.calledWith(
      configPath,
      true
    );
  });

  it('should not set config when grunt key is not found', function() {
    fakeCliOptions._[0] = 'hello:world';
    var options = {
      bar: {
        grunt: ':joe',
        key: 'foo.bar'
      }
    };
    getApplyTaskOptions()(options);
    expect(fakeGrunt.config.set).not.to.have.been.called;
  });
});
