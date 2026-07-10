/**
 * E2E smoke: modbus-response-filter HTTP endpoint and payload validation
 */

'use strict'

const assert = require('assert')
const helper = require('node-red-node-test-helper')
const allModbusTestNodes = require('../helper/all-modbus-test-nodes')
const { globalTestHelper } = require('../helper/mocha-global-setup')
const { deployFcFlow, waitForTestNode } = require('../helper/fc-e2e-helper')

const testFlows = require('../units/flows/modbus-response-filter-flows')

helper.init(require.resolve('node-red'))

const coreModbusNodes = allModbusTestNodes.filter((n) =>
  n !== require('../../src/modbus-client-tls') &&
  n !== require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls'))

describe('Modbus Response Filter E2E Tests', function () {
  this.timeout(20000)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(async function () {
    await helper.setFlows([])
  })

  it('should expose IO value names via HTTP when flow is deployed', function (done) {
    deployFcFlow(helper, coreModbusNodes, globalTestHelper, testFlows.testToFilterFlow)
      .then(async () => {
        const filterNode = await waitForTestNode(helper, 'e8041f6236cbaee4')
        filterNode.ioFile.configData = ''

        helper.request()
          .get('/modbus/iofile/valuenames')
          .expect(200)
          .end(function (err, res) {
            if (err) return done(err)
            assert.strictEqual(res.body, '')
            done()
          })
      })
      .catch(done)
  })

  it('should reject payload length mismatch when showErrors is enabled', async function () {
    await deployFcFlow(helper, coreModbusNodes, globalTestHelper, testFlows.testToFilterFlow)

    const filterNode = await waitForTestNode(helper, 'e8041f6236cbaee4')
    filterNode.showErrors = true
    filterNode.registers = 5

    let errorCalled = false
    filterNode.error = function () {
      errorCalled = true
    }

    filterNode.receive({ payload: [{ name: 'test' }] })

    assert.strictEqual(errorCalled, true)
  })
})
