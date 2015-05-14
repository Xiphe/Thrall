'use strict';

module.exports = {
  init: function(config) {
    var m = require('./lib/module')(config);

    m.get('init')();
  }
};
