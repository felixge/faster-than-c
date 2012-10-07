#!/usr/bin/env node

var common  = require('../../common');
var libName = process.argv[2];
var lib     = require('./libs/' + libName);

var options = {
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'node_mysql_test',
};

lib.connect(options, function(err, connection) {
  if (err) throw err;

  common.run(libName, function(cb) {
    lib.query(connection, 'SELECT * FROM blog_posts', function(err, rows, bytes) {
      if (err) throw err;

      cb(null, {rows: rows, bytes: bytes});
    });
  });
});

