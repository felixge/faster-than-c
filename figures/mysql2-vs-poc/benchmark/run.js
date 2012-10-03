#!/usr/bin/env node

var common        = require('../../common');
var FixtureStream = require('./FixtureStream');
var libName       = process.argv[2];
var lib           = require('./' + libName);

var rows   = 100* 1000;
var stream = new FixtureStream(__dirname + '/fixtures/100k-blog-rows.mysql');

var fields = [
  {name: 'id'},
  {name: 'title'},
  {name: 'text'},
  {name: 'created'},
  {name: 'updated'},
];

common.run(libName, function(cb) {
  lib(stream, fields, function(err, rows) {
    stream.removeAllListeners();

    cb(err, {bytes: stream.length, rows: rows});
  });
  stream.resume();
});
