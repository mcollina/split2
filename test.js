
var test      = require('tap').test
  , split     = require('./')
  , callback  = require('callback-stream')
  , strcb     = callback.bind(null, { decodeStrings: false })

test('split two lines on end', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello\nworld')
})

test('split two lines on two writes', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.write('hello')
  input.write('\nworld')
  input.end()
})

test('accumulate multiple writes', function(t) {
  t.plan(1)

  var input = split()

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['helloworld'])
  }))

  input.write('hello')
  input.write('world')
  input.end()
})

test('split using a custom char', function(t) {
  t.plan(1)

  var input = split({ separator: '~' })

  input.pipe(strcb(function(err, list) {
    t.deepEqual(list, ['hello', 'world'])
  }))

  input.end('hello~world')
})
