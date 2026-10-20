'use strict'

const test = require('tape')
const split = require('./')
const callback = require('callback-stream')
const strcb = callback.bind(null, { decodeStrings: false })
const objcb = callback.bind(null, { objectMode: true })

test('split two lines on end', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\nworld')
})

test('split two lines on two writes', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.write('hello')
  input.write('\nworld')
  input.end()
})

test('split four lines on three writes', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world', 'bye', 'world'])
  }))

  input.write('hello\nwor')
  input.write('ld\nbye\nwo')
  input.write('rld')
  input.end()
})

test('accumulate multiple writes', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['helloworld'])
  }))

  input.write('hello')
  input.write('world')
  input.end()
})

test('split using a custom string matcher', function (t) {
  t.plan(2)

  const input = split('~')

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})

test('split using a custom regexp matcher', function (t) {
  t.plan(2)

  const input = split(/~/)

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})

test('support an option argument', function (t) {
  t.plan(2)

  const input = split({ highWaterMark: 2 })

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\nworld')
})

test('support a mapper function', function (t) {
  t.plan(2)

  const a = { a: '42' }
  const b = { b: '24' }

  const input = split(JSON.parse)

  input.pipe(objcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, [a, b])
  }))

  input.write(JSON.stringify(a))
  input.write('\n')
  input.end(JSON.stringify(b))
})

test('split lines windows-style', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\r\nworld')
})

test('splits a buffer', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end(Buffer.from('hello\nworld'))
})

test('do not end on undefined', function (t) {
  t.plan(2)

  const input = split(function (line) { })

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, [])
  }))

  input.end(Buffer.from('hello\nworld'))
})

test('has destroy method', function (t) {
  t.plan(1)

  const input = split(function (line) { })

  input.on('close', function () {
    t.ok(true, 'close emitted')
    t.end()
  })

  input.destroy()
})

test('support custom matcher and mapper', function (t) {
  t.plan(4)

  const a = { a: '42' }
  const b = { b: '24' }
  const input = split('~', JSON.parse)

  t.equal(input.matcher, '~')
  t.equal(typeof input.mapper, 'function')

  input.pipe(objcb(function (err, list) {
    t.notOk(err, 'no errors')
    t.deepEqual(list, [a, b])
  }))

  input.write(JSON.stringify(a))
  input.write('~')
  input.end(JSON.stringify(b))
})

test('support custom matcher and options', function (t) {
  t.plan(6)

  const input = split('~', { highWaterMark: 1024 })

  t.equal(input.matcher, '~')
  t.equal(typeof input.mapper, 'function')
  t.equal(input._readableState.highWaterMark, 1024)
  t.equal(input._writableState.highWaterMark, 1024)

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})

test('support mapper and options', function (t) {
  t.plan(6)

  const a = { a: '42' }
  const b = { b: '24' }
  const input = split(JSON.parse, { highWaterMark: 1024 })

  t.ok(input.matcher instanceof RegExp, 'matcher is RegExp')
  t.equal(typeof input.mapper, 'function')
  t.equal(input._readableState.highWaterMark, 1024)
  t.equal(input._writableState.highWaterMark, 1024)

  input.pipe(objcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, [a, b])
  }))

  input.write(JSON.stringify(a))
  input.write('\n')
  input.end(JSON.stringify(b))
})

test('split utf8 chars', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['烫烫烫', '锟斤拷'])
  }))

  const buf = Buffer.from('烫烫烫\r\n锟斤拷', 'utf8')
  for (let i = 0; i < buf.length; ++i) {
    input.write(buf.slice(i, i + 1))
  }
  input.end()
})

test('split utf8 chars 2by2', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['烫烫烫', '烫烫烫'])
  }))

  const str = '烫烫烫\r\n烫烫烫'
  const buf = Buffer.from(str, 'utf8')
  for (let i = 0; i < buf.length; i += 2) {
    input.write(buf.slice(i, i + 2))
  }
  input.end()
})

test('split lines when the \n comes at the end of a chunk', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.write('hello\n')
  input.end('world')
})

test('truncated utf-8 char', function (t) {
  t.plan(2)

  const input = split()

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['烫' + Buffer.from('e7', 'hex').toString()])
  }))

  const str = '烫烫'
  const buf = Buffer.from(str, 'utf8')

  input.write(buf.slice(0, 3))
  input.end(buf.slice(3, 4))
})

test('maximum buffer limit', function (t) {
  t.plan(1)

  const input = split({ maxLength: 2 })
  input.on('error', function (err) {
    t.ok(err)
  })

  input.resume()

  input.write('hey')
})

test('readable highWaterMark', function (t) {
  const input = split()
  t.equal(input._readableState.highWaterMark, 16)
  t.end()
})

test('maxLength < chunk size', function (t) {
  t.plan(2)

  const input = split({ maxLength: 2 })

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['a', 'b'])
  }))

  input.end('a\nb')
})

test('maximum buffer limit w/skip', function (t) {
  t.plan(2)

  const input = split({ maxLength: 2, skipOverflow: true })

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['a', 'b', 'c'])
  }))

  input.write('a\n123')
  input.write('456')
  input.write('789\nb\nc')
  input.end()
})

for (const { name, chunks, expected } of [
  { name: 'skip overflow at EOF in one chunk', chunks: ['123'], expected: [] },
  { name: 'skip overflow at EOF across chunks', chunks: ['123', '456'], expected: [] },
  { name: 'keep preceding lines when skipping overflow at EOF', chunks: ['a\n123', '456'], expected: ['a'] },
  { name: 'skip overflow with an empty final chunk', chunks: ['123', ''], expected: [] },
  { name: 'flush a valid tail after recovering from overflow', chunks: ['123', '456\na\nbc'], expected: ['a', 'bc'] },
  { name: 'flush a final line at the buffer limit', chunks: ['ab'], expected: ['ab'] }
]) {
  test(name, function (t) {
    t.plan(2)

    const input = split({ maxLength: 2, skipOverflow: true })
    input.pipe(strcb(function (err, list) {
      t.error(err)
      t.deepEqual(list, expected)
    }))

    for (let i = 0; i < chunks.length - 1; i++) input.write(chunks[i])
    input.end(chunks[chunks.length - 1])
  })
}

test('do not map the buffered prefix of an overflowed final line', function (t) {
  t.plan(3)

  const mapped = []
  const input = split(function (line) {
    mapped.push(line)
    return line
  }, { maxLength: 2, skipOverflow: true })

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['a'])
    t.deepEqual(mapped, ['a'])
  }))

  input.write('a\n123')
  input.end('456')
})

test('skip decoder output when the final line has overflowed', function (t) {
  t.plan(2)

  const input = split({ maxLength: 2, skipOverflow: true })
  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, [])
  }))

  input.write('123')
  input.end(Buffer.from([0xe7]))
})

test("don't modify the options object", function (t) {
  t.plan(2)

  const options = {}
  const input = split(options)

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.same(options, {})
  }))

  input.end()
})

test('mapper throws flush', function (t) {
  t.plan(1)
  const error = new Error()
  const input = split(function () {
    throw error
  })

  input.on('error', (err, list) => {
    t.same(err, error)
  })
  input.end('hello')
})

test('mapper throws on transform', function (t) {
  t.plan(1)

  const error = new Error()
  const input = split(function (l) {
    throw error
  })

  input.on('error', (err) => {
    t.same(err, error)
  })
  input.write('a')
  input.write('\n')
  input.end('b')
})

test('supports Symbol.split', function (t) {
  t.plan(2)

  const input = split({
    [Symbol.split] (str) {
      return str.split('~')
    }
  })

  input.pipe(strcb(function (err, list) {
    t.error(err)
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})
