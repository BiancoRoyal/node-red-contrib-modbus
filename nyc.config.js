'use strict'

const defaultExclude = require('@istanbuljs/schema/default-exclude')
const isWindows = require('is-windows')

const platformExclude = [
  isWindows() ? 'lib/posix.js' : 'lib/win32.js',
  '**/*.-test.js'
]

module.exports = {
  exclude: platformExclude.concat(defaultExclude),
  include: [
    'src/**/*.js'
  ],
  all: true,
  'check-coverage': true,
  // ratchet: measured 84.8 / 93.1 / 93.0 / 93.0 on 5.60.3 — keep the gate close below it
  branches: 80,
  lines: 90,
  functions: 90,
  statements: 90,
  watermarks: {
    lines: [60, 85],
    functions: [60, 85],
    branches: [60, 75],
    statements: [60, 85]
  }
}
