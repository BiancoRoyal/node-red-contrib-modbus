#!/usr/bin/env node

/**
 * Script to create missing test flow files
 */

const fs = require('fs')
const path = require('path')

const flowFiles = [
  'modbus-client-flows.js',
  'modbus-io-config-flows.js',
  'modbus-flex-getter-flows.js',
  'modbus-response-filter-flows.js',
  'modbus-queue-info-flows.js',
  'modbus-write-flows.js',
  'modbus-flex-connector-flows.js',
  'modbus-getter-flows.js',
  'modbus-response-flows.js',
  'modbus-server-flows.js',
  'modbus-read-flows.js',
  'modbus-flex-sequencer-flows.js',
  'modbus-flex-fc-flows.js',
  'modbus-flex-write-flows.js'
]

// Create basic flow template for each file
const createFlowTemplate = (name) => {
  const baseName = name.replace('-flows.js', '')
  return `/**
 * Test flows for ${baseName} unit tests
 */

module.exports = {
  // Basic test flow
  testBasicFlow: [
    {
      id: '1',
      type: '${baseName}',
      name: 'Test ${baseName}',
      wires: [['2']]
    },
    {
      id: '2', 
      type: 'helper'
    }
  ],
  
  // Test flow with server
  testWithServerFlow: [
    {
      id: 'server1',
      type: 'modbus-server',
      name: 'Test Server',
      port: 8502
    },
    {
      id: 'client1',
      type: 'modbus-client',
      name: 'Test Client',
      clienttype: 'tcp',
      tcpHost: '127.0.0.1',
      tcpPort: 8502
    },
    {
      id: 'node1',
      type: '${baseName}',
      name: 'Test Node',
      client: 'client1',
      wires: [['helper1']]
    },
    {
      id: 'helper1',
      type: 'helper'
    }
  ],

  // Add more specific flows as needed
  testFlow: [],
  testSimpleFlow: [],
  testMultipleFlow: []
}
`
}

// Create flow files
const flowsDir = path.join(__dirname, '..', 'test', 'units', 'flows')

flowFiles.forEach(file => {
  const filePath = path.join(flowsDir, file)

  // Skip if file already exists
  if (fs.existsSync(filePath)) {
    console.log(`✓ ${file} already exists`)
    return
  }

  const content = createFlowTemplate(file)
  fs.writeFileSync(filePath, content)
  console.log(`✓ Created ${file}`)
})

console.log('\nAll test flow files created!')
