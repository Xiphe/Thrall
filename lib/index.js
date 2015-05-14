'use strict';

module.exports = {
  init: function(config) {
    var m = require('./module')(config);

    m.get('init')();
  }
};
