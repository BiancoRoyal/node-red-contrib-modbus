// const sinon = require('sinon')
// const { expect } = require('chai')
const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))
const testFlow = require('../e2e/flows/modbus-read-e2e-flows')
const nodeUnderTest = require('../../src/modbus-read')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')

const testReadNodes = [clientNode, serverNode, nodeUnderTest]

describe('ModbusRead node', () => {
    before(function (done) {
        helper.startServer(function () {
            done()
        })
    })

    afterEach(function (done) {
        helper.unload().then(function () {
            done()
        }).catch(function () {
            done()
        })
    })

    after(function (done) {
        helper.stopServer(function () {
            done()
        })
    })
    it('simple Node should be loaded without client config', function (done) {
        helper.load(testReadNodes, testFlow.testFlowFore2eTesting, function () {
            helper.getNode('7ae5c3a814b3c02b')
            done()
        })
    })

})
