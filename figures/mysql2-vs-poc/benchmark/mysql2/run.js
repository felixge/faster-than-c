#!/usr/bin/env node

var common        = require('../common');
var Parser        = require('mysql/lib/protocol/Parser');
var RowDataPacket = require('mysql/lib/protocol/packets/RowDataPacket');

common.run('mysql2', function(stream, fields, cb) {
  var parser = new Parser({packetParser: onPacket});
  parser._nextPacketNumber = 8;

  var rows = 0;
  function onPacket(header) {
    var row = new RowDataPacket();

    row.parse(parser, fields, true, false);
    rows++;
  }

  stream
    .on('data', function(buffer) {
      parser.write(buffer);
    })
    .on('end', function() {
      cb(null, rows);
    });
});
