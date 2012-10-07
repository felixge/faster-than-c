function benchmark() {
  // intentionally empty
}

while (true) {
  var start = Date.now();
  benchmark();
  var duration = Date.now() - start;
  console.log(duration);
}
