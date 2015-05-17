module.exports = function() {
  'use strict';

  return require('minimist')(process.argv.slice(2));
};
