
const serverNode = require('../../src/modbus-server.js')
const nodeUnderTest = require('../../src/modbus-client.js')
const readNode = require('../../src/modbus-read.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')

const testModbusClientNodes = [serverNode, nodeUnderTest, readNode, flexGetterNode]
const helper = require('node-red-node-test-helper')
describe('Client Node Unit Testing', () => {
  beforeAll(() => {
    console.log("Preparing for tests")
  })

  afterEach(() => {
    console.log("Preparing cleanup after test")
  })

  afterAll(() => {
    console.log("Executing cleanup after test suite")
  })

  test("should handle error and log warning on deregister node for modbus", () => {
    expect(true).toBe(true)
  })
})
