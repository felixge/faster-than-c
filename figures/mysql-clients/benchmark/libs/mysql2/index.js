var mysql = require('mysql');

exports.connect = function(options, cb) {
  var connection = mysql.createConnection(options);
  connection.connect(function(err) {
    cb(err, connection);
  });
};

exports.query = function(connection, sql, cb) {
  var query = connection.query(sql);
  var rows = 0;

  query
    .on('result', function(row) {
      rows++;
    })
    .on('end', function() {
      cb(null, rows);
    });
};
