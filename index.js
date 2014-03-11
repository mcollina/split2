
var through = require('through2')

function transform(chunk, enc, cb) {
  var list = chunk.toString('utf8').split('\n')
    , remaining = list.pop()
    , i

  if (list.length >= 1) {
    this.push(this._last + list.shift(), 'utf8')
  } else {
    remaining = this._last + remaining
  }

  for (i = 0; i < list.length; i++) {
    this.push(list[i], 'utf8')
  }

  this._last = remaining

  cb()
}

function flush(cb) {
  if (this._last)
    this.push(this._last, 'utf8')

  cb()
}

function split() {

  var stream = through({ encoding: 'utf8' }, transform, flush)

  stream._last = ''

  return stream
}

module.exports = split
