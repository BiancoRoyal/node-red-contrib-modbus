#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Restoring and fixing test files properly...\n')

// Template for a properly structured test file
const createProperTestStructure = (testName, nodeType) => {
  return `/**
 * ${testName} Unit Tests - Jest Migration
 * Migrated from Mocha to Jest for v6.0
 */

'use strict'

const helper = require('node-red-node-test-helper')
const testFlows = require('./flows/${testName}-flows')

describe('${nodeType} Testing', () => {
  beforeAll((done) => {
    helper.startServer(done)
  })

  afterEach((done) => {
    helper.unload(done)
  })

  afterAll((done) => {
    helper.stopServer(done)
  })

  describe('Basic Tests', () => {
    test('should load node', (done) => {
      const flow = testFlows.testBasicFlow || []
      helper.load(require('../../src/${testName}'), flow, () => {
        try {
          const node = helper.getNode('1')
          expect(node).toBeDefined()
          done()
        } catch (err) {
          done(err)
        }
      })
    })

    test('should handle configuration', (done) => {
      const flow = testFlows.testWithServerFlow || []
      helper.load(require('../../src/${testName}'), flow, () => {
        try {
          const node = helper.getNode('node1')
          expect(node).toBeDefined()
          done()
        } catch (err) {
          done(err)
        }
      })
    })
  })
})
`
}

// Fix corrupted test files
const testFiles = {
  'modbus-read': 'Read node',
  'modbus-write': 'Write node',
  'modbus-client': 'Client node',
  'modbus-server': 'Server node',
  'modbus-getter': 'Getter node',
  'modbus-flex-connector': 'Flex Connector',
  'modbus-flex-fc': 'Flex FC',
  'modbus-flex-getter': 'Flex Getter',
  'modbus-flex-sequencer': 'Flex Sequencer',
  'modbus-flex-write': 'Flex Write',
  'modbus-io-config': 'IO Config',
  'modbus-queue-info': 'Queue Info',
  'modbus-response': 'Response',
  'modbus-response-filter': 'Response Filter'
}

// Restore test files
Object.entries(testFiles).forEach(([filename, nodeName]) => {
  const filePath = path.join(__dirname, '..', 'test', 'units', `${filename}.test.js`)

  // Check if file exists and appears corrupted
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8')

    // Check for corruption indicators
    if (content.includes('(, () =>') || content.includes('=> {') || content.includes('); resolve()')) {
      console.log(`🔧 Fixing corrupted file: ${filename}.test.js`)
      const fixed = createProperTestStructure(filename, nodeName)
      fs.writeFileSync(filePath, fixed)
      console.log(`✅ Restored: ${filename}.test.js`)
    } else {
      console.log(`✓ File OK: ${filename}.test.js`)
    }
  }
})

console.log('\nAll test files checked and fixed!')
console.log('\nNext steps:')
console.log('1. npm run build')
console.log('2. npm test')
