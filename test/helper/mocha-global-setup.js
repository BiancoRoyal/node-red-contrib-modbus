/**
 * Global Mocha hooks — single Node-RED test-helper server + Modbus mocks for the full suite.
 */
'use strict'

const sinon = require('sinon')
const helper = require('node-red-node-test-helper')
const { ModbusTestHelper } = require('./modbus-test-helper')
const allModbusTestNodes = require('./all-modbus-test-nodes')
const {
  clearTestFlows,
  resetModbusTestBootstrap,
  isModbusTestBootstrapped,
  markModbusTestBootstrapped,
  hardenModbusFlow,
  cleanFlowPositionData,
  getTestNode
} = require('./test-helper-extensions')

const globalTestHelper = new ModbusTestHelper()
globalTestHelper.setupMocks({
  mockModbusSerial: true,
  mockNetConnections: true,
  mockTimers: false
})

const originalStartServer = helper.startServer.bind(helper)

function ensureServer (done) {
  try {
    helper.init(require.resolve('node-red'))
  } catch (e) {
    // already initialized
  }
  if (helper._server) {
    if (typeof done === 'function') done()
    return
  }
  originalStartServer(done)
}

helper.stopServer = function (done) {
  if (typeof done === 'function') done()
}

helper.startServer = function (done) {
  ensureServer(done)
}
helper._legacyStartServer = originalStartServer

const originalUnload = helper.unload.bind(helper)
helper.unload = function (done) {
  const result = clearTestFlows(helper)
  if (typeof done === 'function') {
    result.then(() => done()).catch(() => done())
    return
  }
  return result
}
helper._legacyUnload = originalUnload

const originalGetNode = helper.getNode.bind(helper)
helper._originalGetNode = originalGetNode
helper.getNode = function (id) {
  return getTestNode(helper, id) || originalGetNode(id)
}

const originalLoad = helper.load.bind(helper)
helper._legacyLoad = originalLoad

helper.load = async function (testNode, testFlow, testCredentials, cb) {
  if (typeof testFlow === 'function') {
    cb = testFlow
    testFlow = testCredentials
    testCredentials = {}
  }
  if (typeof testCredentials === 'function') {
    cb = testCredentials
    testCredentials = {}
  }

  try {
    if (!isModbusTestBootstrapped()) {
      await originalLoad(allModbusTestNodes, [{ id: 'bootstrap-helper', type: 'helper', wires: [] }])
      markModbusTestBootstrapped()
    }
    if (Array.isArray(testFlow) && testFlow.length > 0) {
      const flow = hardenModbusFlow(cleanFlowPositionData(testFlow))
      await helper.setFlows(flow)
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
    if (cb) cb()
  } catch (err) {
    if (cb) cb(err)
    else throw err
  }
}

exports.mochaHooks = {
  beforeAll (done) {
    globalTestHelper.setupMocks({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: false
    })
    ensureServer(async () => {
      try {
        if (!isModbusTestBootstrapped()) {
          await originalLoad(allModbusTestNodes, [{ id: 'bootstrap-helper', type: 'helper', wires: [] }])
          markModbusTestBootstrapped()
        }
        done()
      } catch (err) {
        done(err)
      }
    })
  },

  beforeEach (done) {
    sinon.restore()
    globalTestHelper.cleanup()
    globalTestHelper.setupMocks({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: false
    })
    ensureServer(done)
  },

  afterEach (done) {
    sinon.restore()
    clearTestFlows(helper).then(() => done()).catch(() => done())
  },

  afterAll (done) {
    sinon.restore()
    globalTestHelper.cleanup()
    globalTestHelper.setupMocks({
      mockModbusSerial: true,
      mockNetConnections: true,
      mockTimers: false
    })
    resetModbusTestBootstrap()
    done()
  }
}

exports.globalTestHelper = globalTestHelper
