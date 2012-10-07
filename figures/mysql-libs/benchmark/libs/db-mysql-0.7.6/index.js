var mysql = require('db-mysql');

exports.connect = function(options, cb) {
  options.host = '127.0.0.1';

  var connection = new mysql.Database({
    hostname : options.host,
    user     : options.user,
    password : options.password,
    database : options.database,
  });

  connection.connect(function(err) {
    cb(err, connection);
  });
};

exports.query = function(connection, sql, cb) {
  var query = connection.query();

  var rows = 0;
  query.on('each', function(row, index, last) {
    rows++;

    if (last) {
      cb(null, rows);
    }
  });

  query.execute(sql);
};
