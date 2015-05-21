describe('load sub configs', function() { // jshint ignore: line
  'use strict';

  var proxyquire = require('proxyquire');
  var di = require('di');
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

  function getLoadSubConfigs(proxyquireConfig) {
    return getInjector().invoke(proxyquire(
      lib('loadSubConfigs'),
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
    fakeGrunt.config.merge = function() {};
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

  it('should not load falsely configs', function() {
    sinon.stub(fakeGrunt.config, 'merge');
    getLoadSubConfigs()([undefined], childInjector);
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

  it('should load tasks from runIf blocks', function() {
    sinon.spy(fakeGrunt.config, 'merge');
    fakeGrunt.config.returns(true);
    var loadSubConfigs = getLoadSubConfigs({
      'subtasks/foo/bar': subconfigFactory
    });
    loadSubConfigs([{if: 'bla', task: 'foo:bar'}], childInjector);
    expect(fakeGrunt.config.merge).to.have.been.calledWith(
      {foo: {bar: subconfig}}
    );
  });

  it('should check if subtask is a maintask', function() {
    sinon.spy(fakeGlob, 'sync');
    getLoadSubConfigs({
      'subtasks/foo/bar': subconfigFactory
    })(['foo:bar'], childInjector);
    expect(fakeGlob.sync).to.have.been.calledWith('tasks/foo/bar.+(js|coffee)');
  });

  it(
    'should load the main task instead of subtasksConfig when found',
    function() {
      var taskname = 'foo:bar';
      sinon.stub(fakeGlob, 'sync').returns(['tasks/foo/bar.js']);
      getLoadSubConfigs({
        'tasks/foo/bar': subconfigFactory
      })([taskname], childInjector);
      expect(fakeAddTasks).to.have.been.calledWith([taskname]);
    }
  );
});
