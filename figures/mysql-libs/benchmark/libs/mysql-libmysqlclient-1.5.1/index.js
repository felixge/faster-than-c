var mysql = require('mysql-libmysqlclient');

exports.connect = function(options, cb) {
  var connection = mysql.createConnectionSync();

  connection.connectSync(
    options.host,
    options.user,
    options.password,
    options.database,
    undefined,
    '/var/mysql/mysql.sock'
  );

  if (!connection.connectedSync()) {
    throw new Error('Connection error ' + conn.connectErrno + ': ' + conn.connectError);
  }

  cb(null, connection);
};

exports.query = function(connection, sql, cb) {
  var res = connection.querySync(sql);

  var rows = 0;
  while (row = res.fetchRowSync()) {
    rows++;
  }

  cb(null, rows);
};
