#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const filePath = path.join(__dirname, '..', 'test', 'units', 'modbus-read.test.js')
let content = fs.readFileSync(filePath, 'utf8')

// Fix double closing braces/parentheses at the wrong indentation level
content = content.replace(/^(\s*)\}\)\s*\n\s*\}\)/gm, '$1})')

// Fix malformed tests with extra indentation and closings
content = content.replace(/await helper\.load\(testReadNodes, testFlows\.\w+\)\n\s{4}\n\s{8}/g,
  'await helper.load(testReadNodes, testFlows.$1)\n    \n    ')

// Fix closing braces that are misaligned
content = content.replace(/\n\s{6}\}\)/g, '\n    })')
content = content.replace(/\n\s{4}\}\)\s*\n\s{4}\}\)/g, '\n    })')

fs.writeFileSync(filePath, content)
console.log('✅ Fixed modbus-read.test.js')
