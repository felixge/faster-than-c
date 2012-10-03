#!/usr/bin/env node

var common    = require('../../common');
var libName   = process.argv[2];
var lib       = require('./' + libName);
var loopCount = 50000000;

common.run(libName, loopCount, function() {
  for (var i = 0; i < loopCount; i++) {
    if (lib.twentyThree() !== 23) {
      new Error('failed assert');
    }
  }
});
