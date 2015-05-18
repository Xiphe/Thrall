describe('apply task options', function() {
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
    fakeCliOptions = {};
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

  it('should convert arrays', function() {
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
});
