describe('load sub configs', function() { // jshint ignore: line
  'use strict';

  var proxyquire = require('proxyquire');
  var di = require('di');
  var grunt = require('grunt');
  var validThrallConfig;
  var fakeGrunt;
  var subconfig;
  var fakeGlob;
  var subconfigFactory;
  var childInjector;
  var fakeAddTasks;

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      grunt: ['value', fakeGrunt],
      addTasks: ['value', fakeAddTasks],
      path: ['value', require('path')],
      glob: ['value', fakeGlob],
      getobject: ['value', require('getobject')],
      _: ['value', require('lodash')],
    }]);
  }

  function getMergeGruntPluginConfig(proxyquireConfig) {
    return getInjector().invoke(proxyquire(
      lib('mergeGruntPluginConfig'),
      proxyquireConfig || {}
    ));
  }

  beforeEach(function() {
    fakeAddTasks = sinon.spy();
    fakeAddTasks.TASKS_DIR = 'tasks';
    subconfig = {lorem: 'ipsum'};
    subconfigFactory = function() { return subconfig; };
    subconfigFactory['@noCallThru'] = true;
    childInjector = new di.Injector([]);
    validThrallConfig = {
      dir: './'
    };
    fakeGrunt = {
      config: sinon.stub(),
      verbose: {
        warn: function() {}
      }
    };
    fakeGlob = {
      sync: function() { return false; }
    };
    fakeGrunt.config.get = function() { return {}; };
    fakeGrunt.config.merge = function() {};
  });

  it('should export a factory', function() {
    expect(require(lib('mergeGruntPluginConfig'))).to.be.instanceof(Function);
  });

  it('should provide a function', function() {
    expect(getMergeGruntPluginConfig()).to.be.instanceof(Function);
  });

  it('should throw if subtask could not be loaded', function() {
    subconfigFactory = sinon.stub().throws();

    expect(function() {
      getMergeGruntPluginConfig({
        'config/foo/bar': subconfigFactory
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

    getMergeGruntPluginConfig({
      'config/foo/bar': subconfigFactory,
      'config/foo': fooSubconfigFactory
    })(['foo:bar'], childInjector);

    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {foo: fooSubConfig}
    );
  });

  it('should load and merge sub configs', function() {
    sinon.stub(fakeGrunt.config, 'merge');

    getMergeGruntPluginConfig({
      'config/foo/bar': subconfigFactory
    })(['foo:bar'], childInjector);

    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {foo: {bar: subconfig}}
    );
  });

  it('should not load the same config twice', function() {
    sinon.stub(fakeGrunt.config, 'merge');

    var mergeGruntPluginConfig = getMergeGruntPluginConfig({
      'config/foo/bar': subconfigFactory
    });

    mergeGruntPluginConfig(['foo:bar'], childInjector);
    mergeGruntPluginConfig(['foo:bar']);

    expect(fakeGrunt.config.merge.callCount).to.equal(1);
  });

  it('should not load falsely configs', function() {
    sinon.stub(fakeGrunt.config, 'merge');
    getMergeGruntPluginConfig()([undefined], childInjector);
    expect(fakeGrunt.config.merge).not.to.have.been.called;
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

    var mergeGruntPluginConfig = getMergeGruntPluginConfig({
      'config/watch/foo': subconfigFactory,
      'config/concurrent/bar': concurrentSubconfigFactory,
      'config/lorem/ipsum': loremSubconfigFactory
    });

    mergeGruntPluginConfig(['watch:foo'], childInjector);

    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {lorem: {ipsum: loremSubconfig}}
    );
  });

  it('should load tasks from runIf blocks', function() {
    sinon.spy(fakeGrunt.config, 'merge');
    fakeGrunt.config.returns(true);
    var mergeGruntPluginConfig = getMergeGruntPluginConfig({
      'config/foo/bar': subconfigFactory
    });
    mergeGruntPluginConfig([{if: 'bla', task: 'foo:bar'}], childInjector);
    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {foo: {bar: subconfig}}
    );
  });

  it('should check if subtask is a maintask', function() {
    sinon.spy(fakeGlob, 'sync');
    getMergeGruntPluginConfig({
      'config/foo/bar': subconfigFactory
    })(['foo:bar'], childInjector);
    expect(fakeGlob.sync).to.have.been.calledWith('tasks/foo/bar.+(js|coffee)');
  });

  it(
    'should load the main task instead of subtasksConfig when found',
    function() {
      var taskname = 'foo:bar';
      sinon.stub(fakeGlob, 'sync').returns(['tasks/foo/bar.js']);
      getMergeGruntPluginConfig({
        'tasks/foo/bar': subconfigFactory
      })([taskname], childInjector);
      expect(fakeAddTasks).to.have.been.calledWith([taskname]);
    }
  );

  describe('with grunt', function() {
    afterEach(function() {
      delete grunt.config.data.lol;
    });

    it('should not overwrite configurations from user', function() {
      fakeGrunt = grunt;
      grunt.config.set('lol.rofl', 'awesome');
      getMergeGruntPluginConfig({
        'config/lol/rofl': subconfigFactory
      })(['lol:rofl'], childInjector);
      expect(grunt.config('lol.rofl')).to.equal('awesome');
    });

    it('should use default config if no user config present', function() {
      fakeGrunt = grunt;
      getMergeGruntPluginConfig({
        'config/lol/rofl': subconfigFactory
      })(['lol:rofl'], childInjector);
      expect(grunt.config('lol.rofl')).to.deep.equal(subconfig);
    });

    it('should merge configurations from user', function() {
      subconfig = {lorem: 'ipsum', hase: 'fuchs'};
      fakeGrunt = grunt;
      grunt.config.set('lol.rofl', {everything: 'awesome', lorem: false});
      getMergeGruntPluginConfig({
        'config/lol/rofl': subconfigFactory
      })(['lol:rofl'], childInjector);
      expect(grunt.config('lol.rofl')).to.deep.equal({
        everything: 'awesome',
        lorem: false,
        hase: 'fuchs'
      });
    });
  });

});
