var iterations = 200;

var FixtureStream = require('./FixtureStream');

var fields = [
  {name: 'id'},
  {name: 'title'},
  {name: 'text'},
  {name: 'created'},
  {name: 'updated'},
];

function printHeaders() {
  console.log(['hz', 'time', 'lib', 'rss', 'heapUsed', 'heapTotal'].join('\t'));
}

var printedHeaders = false;

exports.run = function(name, benchmark) {
  if (!printedHeaders) {
    printHeaders();
    printedHeaders = true;
  }

  var stream = new FixtureStream(__dirname + '/fixtures/100k-blog-rows.mysql');

  function iterate() {
    if (!iterations--) {
      return;
    }

    var start = Date.now();
    benchmark(stream, fields, function(err, rows) {
      if (err) throw err;

      var duration = Date.now() - start;
      var hz = Math.round(rows / (duration / 1000));
      var memory = process.memoryUsage();

      console.log([hz, Date.now(), name, memory.rss, memory.heapUsed, memory.heapTotal].join('\t'));

      stream.removeAllListeners();

      process.nextTick(iterate);
    });

    stream.resume();
  }

  iterate();
};
