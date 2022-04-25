'use strict';

const defaultExclude = require('@istanbuljs/schema/default-exclude');
const isWindows = require('is-windows');

let platformExclude = [
  isWindows() ? 'lib/posix.js' : 'lib/win32.js',
  '**/*.-test.js'
];

module.exports = {
  exclude: platformExclude.concat(defaultExclude),
  "include": [
    "src/**/*.js"
  ],
  all: true,
  'check-coverage': true,
  "branches": 80,
  "lines": 80,
  "functions": 80,
  "statements": 80,
  "watermarks": {
    "lines": [80, 95],
    "functions": [80, 95],
    "branches": [80, 95],
    "statements": [80, 95]
  }
};