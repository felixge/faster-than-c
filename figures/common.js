var duration = 90 * 1000;

exports.run = function(name, benchmark) {
  var startup = Date.now();
  var start;

  var number = 0;

  function callback(err, extra) {
    var duration = Date.now() - start;

    if (err) throw err;

    var memory   = process.memoryUsage();
    var versions = process.versions;

    var results = {
      benchmark   : name,
      number      : ++number,
      duration    : duration,
      time        : Date.now(),
      rss         : memory.rss,
      heapUsed    : memory.heapUsed,
      heapTotal   : memory.heapTotal,
      nodeVersion : process.versions.node,
      v8Version   : process.versions.v8,
    };

    for (var key in extra) {
      results[key] = extra[key];
    }

    print(results);

    process.nextTick(run);
  };

  function run() {
    if (startup + duration < Date.now()) {
      return;
    }

    if (benchmark.length > 0) {
      start = Date.now();
      benchmark(callback);
    } else {
      start = Date.now();
      benchmark();
      callback(null);
    }
  }

  run();
};

var printedKeys = false;
function print(results) {
  var keys = Object.keys(results);
  if (!printedKeys) {
    console.log(keys.join('\t'));
    printedKeys = true;
  }

  var values = keys.map(function(key) {
    return results[key];
  });

  console.log(values.join('\t'));
};
