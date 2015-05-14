describe('Thrall', function() {
  'use strict';

  var proxyquire = require('proxyquire');
  var di = require('di');

  it('should expose init function', function() {
    expect(require(lib('index')).init).to.be.an.instanceof(Function);
  });

  it('should delegate to init', function() {
    var fakeModule = sinon.stub();
    var fakeInit = sinon.stub();
    var fakeInjector = new di.Injector([{
      init: ['value', fakeInit]
    }]);

    fakeModule.returns(fakeInjector);
    var fakeConfig = {};

    proxyquire(lib('index'), {
      './module': fakeModule
    }).init(fakeConfig);

    expect(fakeModule).to.have.been.calledWith(fakeConfig);
    expect(fakeInit).to.have.been.called;
  });
});
