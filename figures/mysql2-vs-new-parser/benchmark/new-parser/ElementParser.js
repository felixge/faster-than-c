var IEEE_754_BINARY_64_PRECISION = Math.pow(2, 53);
var util = require('util');

module.exports = ElementParser;
function ElementParser() {
  this.writable     = true;
  this._offset      = 0;
  this._buffer      = new Buffer(0);
}

ElementParser.prototype.write = function(buffer) {
  this.append(buffer);
};

ElementParser.prototype.append = function(newBuffer) {
  // If resume() is called, we don't pass a buffer to write()
  if (!newBuffer) {
    return;
  }

  var oldBuffer = this._buffer;
  var bufferedBytes = this.bufferedBytes();
  var newLength = bufferedBytes + newBuffer.length;

  var combinedBuffer = (this._offset > newLength)
    ? oldBuffer.slice(0, newLength)
    : new Buffer(newLength);

  oldBuffer.copy(combinedBuffer, 0, this._offset);
  newBuffer.copy(combinedBuffer, bufferedBytes);

  this._buffer = combinedBuffer;
  this._offset = 0;
};

ElementParser.prototype.end = function() {
  this.emit('end');
};

ElementParser.prototype.bufferedBytes = function() {
  return this._buffer.length - this._offset;
};


ElementParser.prototype.unsignedNumber = function(bytes) {
  var bytesRead = 0;
  var value     = 0;

  while (bytesRead < bytes) {
    var byte = this._buffer[this._offset++];

    value += byte * Math.pow(256, bytesRead);

    bytesRead++;
  }

  return value;
};

ElementParser.prototype.skip = function(bytes) {
  this._offset += bytes;
};

ElementParser.prototype.parseLengthCodedIntegerString = function() {
  var length = this.parseLengthCodedNumber();

  if (length === null) {
    return null;
  }

  var number = 0;
  for (var i = 0; i < length; i++) {
    number += this._buffer[this._offset++] - 48;
  }

  return number;
};

ElementParser.prototype.parseLengthCodedString = function() {
  var length = this.parseLengthCodedNumber();

  if (length === null) {
    return null;
  }

  return this.parseString(length);
};

ElementParser.prototype.parseLengthCodedNumber = function() {
  var byte = this._buffer[this._offset++];

  if (byte <= 251) {
    return (byte === 251)
      ? null
      : byte;
  }

  var length;
  if (byte === 252) {
    length = 2;
  } else if (byte === 253) {
    length = 3;
  } else if (byte === 254) {
    length = 8;
  } else {
    throw new Error('parseLengthCodedNumber: Unexpected first byte: ' + byte);
  }

  var value = 0;
  for (var bytesRead = 0; bytesRead < length; bytesRead++) {
    var byte = this._buffer[this._offset++];
    value += Math.pow(256, bytesRead) * byte;
  }

  if (value >= IEEE_754_BINARY_64_PRECISION) {
    throw new Error(
      'parseLengthCodedNumber: JS precision range exceeded, ' +
      'number is >= 53 bit: "' + value + '"'
    );
  }

  return value;
};

ElementParser.prototype.parseString = function(length) {
  var offset = this._offset + this._buffer.offset;
  var end = offset + length;

  var value = this._buffer.parent.utf8Slice(offset, end);

  this._offset = end;
  return value;
};
