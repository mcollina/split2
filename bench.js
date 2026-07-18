'use strict'

const split = require('./')
const bench = require('fastbench')
const binarySplit = require('binary-split')
const fs = require('fs')
const { createInterface } = require('readline')

function benchSplit (cb) {
  fs.createReadStream('package.json')
    .pipe(split())
    .on('end', cb)
    .resume()
}

function benchBinarySplit (cb) {
  fs.createReadStream('package.json')
    .pipe(binarySplit())
    .on('end', cb)
    .resume()
}

function benchCreateInterface (cb) {
  createInterface({
    input: fs.createReadStream('package.json'),
    crlfDelay: Infinity
  }).on('close', cb)
}

const run = bench([
  benchSplit,
  benchBinarySplit,
  benchCreateInterface
], 10000)

run(run)
