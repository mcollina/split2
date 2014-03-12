
var through = require('through2')

function transform(chunk, enc, cb) {
  var list = chunk.split(this.matcher)
    , remaining = list.pop()
    , i

  if (list.length >= 1) {
    this.push(this.mapper((this._last + list.shift())))
  } else {
    remaining = this._last + remaining
  }

  for (i = 0; i < list.length; i++) {
    this.push(this.mapper(list[i]))
  }

  this._last = remaining

  cb()
}

function flush(cb) {
  if (this._last)
    this.push(this.mapper(this._last))

  cb()
}

function noop(incoming) {
  return incoming
}

function split(matcher, mapper, options) {

  if (typeof matcher === 'object' && !(matcher instanceof RegExp)) {
    options = matcher
    matcher = null
  }

  if (typeof matcher === 'function') {
    mapper = matcher
    matcher = null
  }

  options = options || {}
  options.decodeStrings = false

  var stream = through(options, transform, flush)

  // this stream is in objectMode only in the readable part
  stream._readableState.objectMode = true;

  stream._last = ''
  stream.matcher = matcher || '\n'
  stream.mapper = mapper || noop

  return stream
}

module.exports = split
