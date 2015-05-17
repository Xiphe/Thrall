describe('injector', function() {
  'use strict';

  var proxyquire = require('proxyquire');

  it('should expose a factory', function() {
    expect(require(lib('injector'))).to.be.an.instanceof(Function);
  });

  it('should instantiate a new Injector', function() {
    function FakeInjector() {}
    var injectorFactory = proxyquire(lib('injector'), {
      di: {Injector: FakeInjector}
    });

    expect(injectorFactory()).to.be.an.instanceof(FakeInjector);
  });

  it('should provide the correct modules', function() {
    var FakeInjector = sinon.stub();

    proxyquire(lib('injector'), {
      di: {Injector: FakeInjector}
    })();

    expect(
        FakeInjector.getCall(0).args[0][0]
      ).to.have.all.keys(
        '_',
        'cliOptions',
        'findupSync',
        'fs',
        'glob',
        'getobject',
        'grunt',
        'path'
      );
  });
});
