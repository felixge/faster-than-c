var mysql = require('mysql');

exports.connect = function(options, cb) {
  options.typeCast = false;
  var connection = mysql.createConnection(options);
  connection.connect(function(err) {
    cb(err, connection);
  });
};

exports.query = function(connection, sql, cb) {
  var query = connection.query(sql);
  var rows = 0;

  var byteOffset = connection._socket.bytesRead;

  query
    .on('result', function(row) {
      rows++;
    })
    .on('end', function() {
      var bytes = connection._socket.bytesRead - byteOffset;
      cb(null, rows, bytes);
    });
};
