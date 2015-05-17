describe('CLI options', function() {
  'use strict';

  var proxyquire = require('proxyquire');

  it('should export a factory', function() {
    expect(require(lib('cliOptions'))).to.be.instanceof(Function);
  });

  it('should wrap minimist', function() {
    var fakeMinimist = sinon.stub();
    var cliArgs = {foo: 'bar'};
    fakeMinimist.returns(cliArgs);
    var getCliOptions = proxyquire(lib('cliOptions'), {
      minimist: fakeMinimist
    });
    expect(getCliOptions()).to.equal(cliArgs);
    expect(fakeMinimist).to.have.been.called;
  });
});
