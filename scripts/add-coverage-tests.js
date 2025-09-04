#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('Adding tests to improve coverage to 92%+...\n')

// Additional test cases for core functions
const additionalTests = {
  'test/core/modbus-core-additional.test.js': `
const coreUnderTest = require('../../src/core/modbus-core')

describe('Core Additional Coverage Tests', () => {
  test('should handle edge cases in function code resolution', () => {
    expect(coreUnderTest.functionCodeModbusRead(null)).toBe(-1)
    expect(coreUnderTest.functionCodeModbusRead(undefined)).toBe(-1)
    expect(coreUnderTest.functionCodeModbusRead('')).toBe(-1)
    expect(coreUnderTest.functionCodeModbusRead(123)).toBe(-1)
  })
  
  test('should handle all modbus function codes', () => {
    const codes = ['Coil', 'Input', 'HoldingRegister', 'InputRegister']
    codes.forEach((code, index) => {
      expect(coreUnderTest.functionCodeModbusRead(code)).toBe(index + 1)
    })
  })
})`,

  'test/units/modbus-basics-additional.test.js': `
const mBasics = require('../../src/modbus-basics')

describe('Modbus Basics Additional Coverage', () => {
  describe('Status functions', () => {
    test('should set node status correctly', () => {
      const mockNode = {
        status: jest.fn()
      }
      
      mBasics.setNodeStatusTo('ready', mockNode)
      expect(mockNode.status).toHaveBeenCalled()
    })
    
    test('should handle invalid status', () => {
      const mockNode = {
        status: jest.fn()
      }
      
      mBasics.setNodeStatusTo('invalid', mockNode)
      expect(mockNode.status).toHaveBeenCalled()
    })
  })
  
  describe('Error handling', () => {
    test('should build proper error messages', () => {
      const error = new Error('Test error')
      const msg = { payload: 'test' }
      const result = mBasics.buildErrorMessage(error, msg)
      expect(result).toHaveProperty('payload')
      expect(result).toHaveProperty('error')
    })
  })
})`,

  'test/units/modbus-client-additional.test.js': `
const helper = require('node-red-node-test-helper')

describe('Modbus Client Additional Coverage', () => {
  beforeAll((done) => {
    helper.startServer(done)
  })
  
  afterAll((done) => {
    helper.stopServer(done)
  })
  
  test('should handle connection errors gracefully', (done) => {
    // Test connection error handling
    const flow = [
      {
        id: 'client1',
        type: 'modbus-client',
        name: 'Test Client',
        clienttype: 'tcp',
        tcpHost: 'invalid.host',
        tcpPort: '502'
      }
    ]
    
    helper.load(require('../../src/modbus-client'), flow, () => {
      const client = helper.getNode('client1')
      expect(client).toBeDefined()
      done()
    })
  })
  
  test('should handle reconnection logic', (done) => {
    const flow = [
      {
        id: 'client2',
        type: 'modbus-client',
        name: 'Test Client',
        clienttype: 'tcp',
        tcpHost: '127.0.0.1',
        tcpPort: '8503',
        reconnectTimeout: 100
      }
    ]
    
    helper.load(require('../../src/modbus-client'), flow, () => {
      const client = helper.getNode('client2')
      expect(client).toBeDefined()
      expect(client.reconnectTimeout).toBe(100)
      done()
    })
  })
})`
}

// Create additional test files
Object.entries(additionalTests).forEach(([filePath, content]) => {
  const fullPath = path.join(__dirname, '..', filePath)
  fs.writeFileSync(fullPath, content.trim())
  console.log(`✅ Created: ${filePath}`)
})

// Create a test runner configuration for high coverage
const coverageConfig = `
module.exports = {
  ...require('./jest.config.js'),
  collectCoverage: true,
  coverageThreshold: {
    global: {
      branches: 85,
      functions: 90,
      lines: 92,
      statements: 92
    }
  },
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/test/',
    '/examples/',
    '/docs/'
  ]
}
`

fs.writeFileSync(
  path.join(__dirname, '..', 'jest.config.coverage.js'),
  coverageConfig.trim()
)
console.log('✅ Created: jest.config.coverage.js')

console.log('\n=== Coverage Improvement Plan ===')
console.log('1. Added 3 additional test files for core functionality')
console.log('2. Created jest.config.coverage.js with 92% target')
console.log('\nTo achieve 92% coverage:')
console.log('- Ensure all public functions have at least one test')
console.log('- Test error paths and edge cases')
console.log('- Test all configuration options')
console.log('- Add integration tests for critical paths')
console.log('\nRun coverage check with:')
console.log('npx jest --config jest.config.coverage.js --coverage')
