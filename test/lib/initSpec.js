describe('init', function() {
  'use strict';

  var validThrallConfig;
  var fakeGrunt;
  var di = require('di');

  function getInjector() {
    return new di.Injector([{
      thrallConfig: ['value', validThrallConfig],
      path: ['value', require('path')],
      grunt: ['value', fakeGrunt],
      registerSubtasks: ['value', function() {}],
      addTasks: ['value', function() {}],
      baseInjector: ['value', new di.Injector([])],
      _: ['value', require('lodash')]
    }]);
  }

  function doInit() {
    getInjector().invoke(require(lib('init')))();
  }

  beforeEach(function() {
    validThrallConfig = {
      name: 'foo',
      dir: './',
      basePath: './'
    };
    fakeGrunt = {
      config: function() {}
    };
    fakeGrunt.config.set = function() {};
  });

  it('should expose a factory', function() {
    expect(require(lib('init'))).to.be.instanceof(Function);
  });

  it('should provide a init function', function() {
    expect(require(lib('init'))()).to.be.instanceof(Function);
  });

  it('should throw when thrallConfig has no dir', function() {
    delete validThrallConfig.dir;
    expect(function() {
      doInit();
    }).to.throw(Error);
  });

  it('should throw when thrallConfig has no basePath', function() {
    delete validThrallConfig.basePath;
    var init = getInjector().invoke(require(lib('init')));
    expect(function() {
      init();
    }).to.throw(Error);
  });

  it('should throw when there is no package.json in basepath', function() {
    validThrallConfig.basePath = './non-exiting-folder';
    expect(function() {
      doInit();
    }).to.throw(Error);
  });

  it(
    'should not throw when there is no package.json ' +
    'in basepath but a pkg on config',
    function() {
      validThrallConfig.basePath = './non-exiting-folder';
      validThrallConfig.pkg = {};
      expect(function() {
        doInit();
      }).not.to.throw(Error);
    }
  );

  it('should use name from pkg if no name present on config', function() {
    delete validThrallConfig.name;
    validThrallConfig.pkg = {name: 'bar'};
    doInit();
    expect(validThrallConfig.name).to.equal('bar');
  });

  describe('config and defaults', function() {
    var defaults;
    var userConfig;

    beforeEach(function() {
      defaults = {a: 'foo', b: 'bar'};
      userConfig = {a: 'lorem', c: 'ipsum'};
      sinon.stub(fakeGrunt, 'config');
      sinon.stub(fakeGrunt.config, 'set');
      fakeGrunt.config.returns(userConfig);
      validThrallConfig.defaults = function() {
        return defaults;
      };
    });

    it('should invoke defaults if present', function() {
      /* can not use a spy here due to dependency injection */
      var called = 0;
      validThrallConfig.defaults = function() {
        called += 1;
      };
      doInit();
      expect(called).to.equal(1);
    });

    it(
      'should provide a helper to manipulate config after merge',
      function(done) {
        validThrallConfig.defaults = function(merged) {
          merged(function(config) {
            expect(config).to.deep.equal(userConfig);
            done();
          });

          return {};
        };
        doInit();
      }
    );

    it('should merge user config with defaults', function() {
      var name = 'verry-special';
      validThrallConfig.name = name;
      doInit();
      expect(fakeGrunt.config).to.have.been.calledWith(name);
      expect(fakeGrunt.config.set).to.have.been.calledWith(
        name,
        {a: 'lorem', b: 'bar', c: 'ipsum'}
      );
    });

    it('should remove protected entries from user config', function() {
      userConfig._ = {secret: 'overwritten'};
      doInit();
      expect(userConfig._).not.to.exist;
    });
  });

});
