'use strict'

const assert = require('assert')
const { getPort, getTestNode, deployModbusFlow } = require('./test-helper-extensions')

function baseServer (id, port) {
  return {
    id,
    type: 'modbus-server',
    hostname: '127.0.0.1',
    serverPort: String(port),
    responseDelay: 10,
    delayUnit: 'ms',
    coilsBufferSize: 4096,
    holdingBufferSize: 4096,
    inputBufferSize: 4096,
    discreteBufferSize: 4096,
    showErrors: false
  }
}

function baseClient (id, port) {
  return {
    id,
    type: 'modbus-client',
    clienttype: 'tcp',
    tcpHost: '127.0.0.1',
    tcpPort: String(port),
    unit_id: 1,
    commandDelay: 10,
    clientTimeout: 1000,
    reconnectOnTimeout: false
  }
}

async function setupFcMocks (globalTestHelper) {
  // Never call cleanup() here — restoring stubs mid-suite lets stale clients
  // (e.g. complete-e2e timeout test at 192.168.99.99) hit real TCP and flake later FC tests.
  globalTestHelper.setupMocks({
    mockModbusSerial: true,
    mockNetConnections: true,
    mockTimers: false
  })
}

async function waitForTestNode (helper, id, timeoutMs = 5000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    const node = getTestNode(helper, id)
    if (node) return node
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error(`node ${id} not deployed within ${timeoutMs}ms`)
}

async function deployFcFlow (helper, nodes, globalTestHelper, flow) {
  await setupFcMocks(globalTestHelper)
  await deployModbusFlow(helper, nodes, flow)
}

async function waitForHelper (helper, helperId, assertFn, timeoutMs = 15000) {
  const helperNode = await waitForTestNode(helper, helperId, Math.min(timeoutMs, 5000))
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('timeout waiting for helper message'))
    }, timeoutMs)
    helperNode.on('input', (msg) => {
      try {
        assertFn(msg)
        clearTimeout(timer)
        resolve(msg)
      } catch (err) {
        clearTimeout(timer)
        reject(err)
      }
    })
  })
}

function assertReadFc (msg, fc, quantity) {
  assert(Array.isArray(msg.payload), 'payload should be array')
  assert.strictEqual(msg.payload.length, quantity)
  assert(msg.input && msg.input.payload, 'input.payload expected')
  assert.strictEqual(msg.input.payload.fc, fc)
}

function assertWriteFc (msg, fc) {
  assert(msg.input && msg.input.payload, 'input.payload expected')
  assert.strictEqual(msg.input.payload.fc, fc)
}

async function buildServerClientFlow (nodeConfig) {
  const port = await getPort()
  return {
    port,
    flow: [
      baseServer('fc-server', port),
      baseClient('fc-client', port),
      nodeConfig,
      { id: 'fc-helper', type: 'helper', wires: [] }
    ]
  }
}

module.exports = {
  baseServer,
  baseClient,
  setupFcMocks,
  deployFcFlow,
  waitForTestNode,
  waitForHelper,
  assertReadFc,
  assertWriteFc,
  buildServerClientFlow,
  getTestNode
}
