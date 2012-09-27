var util          = require('util');
var Stream        = require('stream').Stream;
var PacketHeader  = require('./PacketHeader');
var ElementParser = require('./ElementParser');
var Row           = eval('(' + require('./Row').toString() + ')');

module.exports = Protocol;
util.inherits(Protocol, Stream);
function Protocol() {
  Stream.call(this);

  this.writable = true;
  this._elements = new ElementParser();
  this._header = null;
  this._rows = [];

}

Protocol.prototype.write = function(buffer) {
  var elements = this._elements;

  elements.write(buffer);

  while (true) {
    var header = this.header(elements);
    if (!header) {
      break;
    }

    if (this.parseRow && !this.parseRow()) {
      break;
    }

    this._header = null;
  }
};

Protocol.prototype.header = function(elements) {
  if (this._header) {
    return this._header;
  }

  if (elements.bufferedBytes() < 4) {
    return;
  }

  return this._header = new PacketHeader(
    elements.unsignedNumber(3),
    elements.unsignedNumber(1)
  );
};

Protocol.prototype.parseRow = function() {
  if (this._elements.bufferedBytes() < this._header.length) {
    return false;
  }

  this.onRow(this._parseRow());

  return true;
};


// Slow: Optimized by eval below

//Protocol.prototype._parseRow = function() {
  //var row = [];

  //for (var i = 0; i < this._fields.length; i++) {
    //var field = this._fields[i];
    //var value = this._elements.parseLengthCodedString();
    //row[field] = value;
  //}

  //return row;
//};

Protocol.prototype._setFields = function(fields) {
  var code = [
    'return {'
  ];

  fields.forEach(function(field) {
    code.push('"' + field.name + '":' + 'this._elements.parseLengthCodedString(),');
  });

  code.push('};');

  // eval for the win!
  this._parseRow = new Function(code.join('\n'));
};

//Protocol.prototype.parseRow = eval('(' + Protocol.prototype.parseRow.toString() + ')');

Protocol.prototype.end = function() {
  this.emit('end');
};
