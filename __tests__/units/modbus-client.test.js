const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')

const testModbusClientNodes = [serverNode, nodeUnderTest, readNode, flexGetterNode]
const helper = require('node-red-node-test-helper')
const testFlows = require('./flows/modbus-client-flows.js')

describe('Client Node Unit Testing', () => {
  beforeAll((done) => {
    helper.startServer(done)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  afterAll((done) => {
    helper.unload().then(function() {
      helper.stopServer(done)
    })
  })

  test("deregister modbus get's called with the correct id", (done) => {
    let spy
      helper.load(testModbusClientNodes, testFlows.testClientWithoutServerFlow, () => {
      jest.useFakeTimers()
      const modbusClientNode = helper.getNode('3')
      const clientUserNodeId = 'clientUserNodeId'

      spy = jest.spyOn(modbusClientNode, 'closeConnectionWithoutRegisteredNodes')
      modbusClientNode.registeredNodeList[clientUserNodeId] = true
    })

    expect(spy).toHaveBeenCalled()
    done()
  })
})
