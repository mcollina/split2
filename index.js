
var through = require('through2')

function transform(chunk, enc, cb) {
  var list = chunk.split(this.separator)
    , remaining = list.pop()
    , i

  if (list.length >= 1) {
    this.push(this._last + list.shift())
  } else {
    remaining = this._last + remaining
  }

  for (i = 0; i < list.length; i++) {
    this.push(list[i])
  }

  this._last = remaining

  cb()
}

function flush(cb) {
  if (this._last)
    this.push(this._last)

  cb()
}

function split(options) {

  options = options || {}
  options.decodeStrings = false
  options.encoding = 'utf8'

  var stream = through(options, transform, flush)

  stream._last = ''
  stream.separator = options.separator || '\n'

  return stream
}

module.exports = split
