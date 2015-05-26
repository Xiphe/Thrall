describe('module', function() {
  'use strict';

  var proxyquire = require('proxyquire');
  var di = require('di');
  var moduleFactory;

  beforeEach(function() {
    moduleFactory = require(lib('module'));
  });

  it('should expose a factory', function() {
    expect(moduleFactory).to.be.an.instanceof(Function);
  });

  it('should throw if called without grunt', function() {
    expect(function() {
      moduleFactory();
    }).to.throw(Error);
  });

  describe('with injector', function() {
    var fakeInjectorFactory;
    var fakeInjector;

    beforeEach(function() {
      fakeInjectorFactory = sinon.stub();
      fakeInjector = new di.Injector([]);
      fakeInjectorFactory.returns(fakeInjector);

      moduleFactory = proxyquire(lib('module'), {
        './injector': fakeInjectorFactory
      });
    });

    it('should initiate the base injector with grunt', function() {
      var fakeGrunt = {};
      moduleFactory({grunt: fakeGrunt});

      expect(fakeInjectorFactory).to.have.been.calledWith(fakeGrunt);
    });

    it('should setup the module with correct submodules', function() {
      sinon.stub(fakeInjector, 'createChild');

      moduleFactory({grunt: {}});

      expect(
        fakeInjector.createChild.getCall(0).args[0][0]
      ).to.have.all.keys(
        'applyTaskOptions',
        'baseInjector',
        'thrallConfig',
        'loadGruntPlugins',
        'runningTasks',
        'loadSubConfigs',
        'addTasks',
        'task',
        'init'
      );
    });
  });
});
