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
  branches: 75,
  lines: 85,
  functions: 85,
  statements: 85,
  watermarks: {
    lines: [60, 85],
    functions: [60, 85],
    branches: [60, 75],
    statements: [60, 85]
  }
}
