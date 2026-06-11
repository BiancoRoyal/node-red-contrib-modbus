#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const glob = require('glob')

// Test files that need updating
const testPatterns = [
  'test/**/*.js',
  'test/**/*.test.js'
]

// Map of old imports to new imports - more patterns to cover all cases
const importMap = {
  // Direct src references
  "require('../../src/modbus-server.js')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  "require('../../src/modbus-server')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  "require('../../src/modbus-server-demo')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-demo')",
  "require('../../src/modbus-server-tls')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')",

  // Three level deep
  "require('../../../src/modbus-server.js')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  "require('../../../src/modbus-server')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  "require('../../../src/modbus-server-demo')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-demo')",
  "require('../../../src/modbus-server-tls')": "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')",

  // With double quotes
  'require("../../src/modbus-server.js")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  'require("../../src/modbus-server")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  'require("../../src/modbus-server-demo")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-demo')",
  'require("../../src/modbus-server-tls")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')",

  'require("../../../src/modbus-server.js")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  'require("../../../src/modbus-server")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')",
  'require("../../../src/modbus-server-demo")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-demo')",
  'require("../../../src/modbus-server-tls")': "require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')",
}

// Counter for tracking updates
let totalFiles = 0
let updatedFiles = 0
let totalReplacements = 0

// Process each test pattern
testPatterns.forEach(pattern => {
  const files = glob.sync(pattern, {
    cwd: path.join(__dirname, '..'),
    absolute: true,
    ignore: ['**/node_modules/**']
  })

  files.forEach(file => {
    totalFiles++
    let content = fs.readFileSync(file, 'utf8')
    const originalContent = content
    let fileReplacements = 0

    // Check and replace each import pattern
    for (const [oldImport, newImport] of Object.entries(importMap)) {
      if (content.includes(oldImport)) {
        content = content.replace(new RegExp(escapeRegExp(oldImport), 'g'), newImport)
        fileReplacements++
        totalReplacements++
      }
    }

    // Write file if changes were made
    if (content !== originalContent) {
      fs.writeFileSync(file, content, 'utf8')
      updatedFiles++
      const relPath = path.relative(path.join(__dirname, '..'), file)
      console.log(`Updated: ${relPath} (${fileReplacements} replacements)`)
    }
  })
})

// Helper function to escape special regex characters
function escapeRegExp (string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Summary
console.log('\n=== Update Summary ===')
console.log(`Total files scanned: ${totalFiles}`)
console.log(`Files updated: ${updatedFiles}`)
console.log(`Total replacements: ${totalReplacements}`)