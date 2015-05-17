describe('load sub configs', function() { // jshint ignore: line
  'use strict';

  var proxyquire = require('proxyquire');
  var di = require('di');
  var validThrallConfig;
  var fakeGrunt;
  var subconfig;
  var subconfigFactory;
  var childInjector;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      grunt: ['value', fakeGrunt],
      path: ['value', require('path')],
      getobject: ['value', require('getobject')],
      _: ['value', require('lodash')]
    }]);
  }

  function getLoadSubConfigs(proxyquireConfig) {
    return getInjector().invoke(proxyquire(
      lib('loadSubConfigs'),
      proxyquireConfig || {}
    ));
  }

  beforeEach(function() {
    subconfig = {lorem: 'ipsum'};
    subconfigFactory = function() { return subconfig; };
    subconfigFactory['@noCallThru'] = true;
    childInjector = new di.Injector([]);
    validThrallConfig = {
      dir: './'
    };
    fakeGrunt = {
      config: {
        merge: function() {}
      },
      verbose: {
        warn: function() {}
      }
    };
  });

  it('should export a factory', function() {
    expect(require(lib('loadSubConfigs'))).to.be.instanceof(Function);
  });

  it('should provide a function', function() {
    expect(getLoadSubConfigs()).to.be.instanceof(Function);
  });

  it('should throw if subtask could not be loaded', function() {
    subconfigFactory = sinon.stub().throws();

    expect(function() {
      getLoadSubConfigs({
        'subtasks/foo/bar': subconfigFactory
      })(['foo:bar'], childInjector);
    }).to.throw(Error);
  });

  it('should load parent config if subtask could not be loaded', function() {
    sinon.spy(fakeGrunt.config, 'merge');
    subconfigFactory = sinon.stub().throws();
    var fooSubConfig = {lorem: 'ipsum'};
    function fooSubconfigFactory() {
      return fooSubConfig;
    }
    fooSubconfigFactory['@noCallThru'] = true;

    getLoadSubConfigs({
      'subtasks/foo/bar': subconfigFactory,
      'subtasks/foo': fooSubconfigFactory
    })(['foo:bar'], childInjector);

    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {foo: fooSubConfig}
    );
  });

  it('should load and merge sub configs', function() {
    sinon.stub(fakeGrunt.config, 'merge');

    getLoadSubConfigs({
      'subtasks/foo/bar': subconfigFactory
    })(['foo:bar'], childInjector);

    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {foo: {bar: subconfig}}
    );
  });

  it('should not load the same config twice', function() {
    sinon.stub(fakeGrunt.config, 'merge');

    var loadSubConfigs = getLoadSubConfigs({
      'subtasks/foo/bar': subconfigFactory
    });

    loadSubConfigs(['foo:bar'], childInjector);
    loadSubConfigs(['foo:bar']);

    expect(fakeGrunt.config.merge.callCount).to.equal(1);
  });

  it('should merge configs of nested tasks', function() {
    subconfig = ['concurrent:bar'];
    var concurrentSubconfig = {tasks: ['lorem:ipsum']};
    var loremSubconfig = {hase: 'igel'};
    var concurrentSubconfigFactory = function() { return concurrentSubconfig; };
    var loremSubconfigFactory = function() { return loremSubconfig; };
    concurrentSubconfigFactory['@noCallThru'] = true;
    loremSubconfigFactory['@noCallThru'] = true;
    sinon.stub(fakeGrunt.config, 'merge');

    var loadSubConfigs = getLoadSubConfigs({
      'subtasks/watch/foo': subconfigFactory,
      'subtasks/concurrent/bar': concurrentSubconfigFactory,
      'subtasks/lorem/ipsum': loremSubconfigFactory
    });

    loadSubConfigs(['watch:foo'], childInjector);

    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {lorem: {ipsum: loremSubconfig}}
    );
  });
});
