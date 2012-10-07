var Client = require('mariasql');

exports.connect = function(options, cb) {
  var connection = new Client();

  connection.connect({
    host     : options.host,
    user     : options.user,
    password : options.password,
    db : options.database,
  });

  connection.on('connect', function() {
    cb(null, connection);
  });
};

exports.query = function(connection, sql, cb) {
  var query = connection.query(sql);
  var rows = 0;

  //var byteOffset = connection._socket.bytesRead;

  query
    .on('result', function(result) {
      result.on('row', function(row) {
        rows++;
      });
    })
    .on('end', function() {
      var bytes = 0;
      //var bytes = connection._socket.bytesRead - byteOffset;
      cb(null, rows, bytes)
    });
};
