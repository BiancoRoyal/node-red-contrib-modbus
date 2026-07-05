/**
 * Unit tests for modbus-getter node
 */

'use strict'

const assert = require('assert')
const sinon = require('sinon')

describe('Modbus Getter Unit Tests', function () {
  let getterModule
  let sandbox
  let mockRED

  beforeEach(function () {
    sandbox = sinon.createSandbox()

    mockRED = {
      nodes: {
        createNode: sinon.stub(),
        registerType: sinon.stub(),
        getNode: sinon.stub()
      },
      httpNode: {
        get: sinon.stub(),
        post: sinon.stub()
      },
      settings: {
        verbose: false
      },
      _: sinon.stub().returnsArg(0),
      log: {
        info: sinon.stub(),
        debug: sinon.stub(),
        trace: sinon.stub(),
        warn: sinon.stub(),
        error: sinon.stub()
      }
    }

    delete require.cache[require.resolve('../../src/modbus-getter')]
    getterModule = require('../../src/modbus-getter')
  })

  afterEach(function () {
    sandbox.restore()
  })

  describe('Module Loading', function () {
    it('should export a function', function () {
      assert.strictEqual(typeof getterModule, 'function')
    })

    it('should register with RED', function () {
      getterModule(mockRED)
      assert.strictEqual(mockRED.nodes.registerType.called, true)
      assert.strictEqual(mockRED.nodes.registerType.firstCall.args[0], 'modbus-getter')
    })
  })

  describe('Node Configuration', function () {
    it('should create node with correct configuration', function () {
      let nodeInstance = null
      const config = {
        id: 'getter-1',
        type: 'modbus-getter',
        name: 'Test Getter',
        dataType: 'HoldingRegister',
        adr: '0',
        quantity: '10',
        server: 'server-1',
        useIOFile: false,
        ioFile: '',
        useIOForPayload: false,
        emptyMsgOnFail: false,
        keepMsgProperties: true,
        showStatusActivities: true,
        showErrors: true,
        unitid: '1'
      }

      mockRED.nodes.createNode.callsFake(function (node, conf) {
        Object.assign(node, conf)
        node.on = sinon.stub()
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.error = sinon.stub()
        node.warn = sinon.stub()
        node.send = sinon.stub()
        nodeInstance = node
      })

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, config)
      })

      getterModule(mockRED)

      assert.notStrictEqual(nodeInstance, null)
      assert.strictEqual(nodeInstance.name, 'Test Getter')
      assert.strictEqual(nodeInstance.dataType, 'HoldingRegister')
      assert.strictEqual(nodeInstance.adr, '0')
      assert.strictEqual(nodeInstance.quantity, '10')
    })

    it('should handle input message correctly', function (done) {
      let nodeInstance = null
      let inputHandler = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub().callsFake((event, handler) => {
          if (event === 'input') {
            inputHandler = handler
          }
        })
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.error = sinon.stub()
        node.send = sinon.stub()
        nodeInstance = node
      })

      const mockClient = {
        on: sinon.stub(),
        registerForModbus: sinon.stub(),
        queueLog: sinon.stub(),
        stateLog: sinon.stub()
      }

      mockRED.nodes.getNode.returns(mockClient)

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-2',
          name: 'Test',
          dataType: 'Coil',
          adr: '10',
          quantity: '5',
          server: 'server-1',
          unitid: '1'
        })
      })

      getterModule(mockRED)

      assert.notStrictEqual(inputHandler, null)
      assert.strictEqual(nodeInstance.status.called, true)
      done()
    })

    it('should handle different data types', function () {
      const dataTypes = ['Coil', 'DiscreteInput', 'HoldingRegister', 'InputRegister']

      dataTypes.forEach(dataType => {
        let nodeInstance = null

        mockRED.nodes.createNode.callsFake(function (node, config) {
          Object.assign(node, config)
          node.on = sinon.stub()
          node.removeAllListeners = sinon.stub()
          node.status = sinon.stub()
          node.send = sinon.stub()
          nodeInstance = node
        })

        mockRED.nodes.registerType.callsFake(function (name, constructor) {
          const node = {}
          constructor.call(node, {
            id: `getter-${dataType}`,
            dataType,
            adr: '0',
            quantity: '1',
            server: 'server-1'
          })
        })

        delete require.cache[require.resolve('../../src/modbus-getter')]
        const freshGetterModule = require('../../src/modbus-getter')
        freshGetterModule(mockRED)

        assert.notStrictEqual(nodeInstance, null)
        assert.strictEqual(nodeInstance.dataType, dataType)
      })
    })

    it('should preserve message properties when configured', function () {
      let nodeInstance = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub()
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.send = sinon.stub()
        nodeInstance = node
      })

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-3',
          keepMsgProperties: true,
          server: 'server-1'
        })
      })

      getterModule(mockRED)

      assert.notStrictEqual(nodeInstance, null)
      assert.strictEqual(nodeInstance.keepMsgProperties, true)
    })

    it('should handle empty message on fail when configured', function (done) {
      let closeHandler = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub().callsFake((event, handler) => {
          if (event === 'close') {
            closeHandler = handler
          }
        })
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.error = sinon.stub()
        node.send = sinon.stub()
      })

      mockRED.nodes.getNode.returns({
        on: sinon.stub(),
        registerForModbus: sinon.stub(),
        deregisterForModbus: sinon.stub().callsFake((id, cb) => {
          if (typeof cb === 'function') cb()
        })
      })

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-4',
          emptyMsgOnFail: true,
          server: 'server-1'
        })
      })

      getterModule(mockRED)

      if (closeHandler) {
        closeHandler(done)
      } else {
        done(new Error('Close handler not registered'))
      }
    })

    it('should handle IO file configuration', function () {
      let nodeInstance = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub()
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.send = sinon.stub()
        nodeInstance = node
      })

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-5',
          useIOFile: true,
          ioFile: 'io-config-1',
          useIOForPayload: true,
          server: 'server-1'
        })
      })

      getterModule(mockRED)

      assert.notStrictEqual(nodeInstance, null)
      assert.strictEqual(nodeInstance.useIOFile, true)
      assert.strictEqual(nodeInstance.useIOForPayload, true)
    })

    it('should handle status activities when enabled', function () {
      let nodeInstance = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub()
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        nodeInstance = node
      })

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-6',
          showStatusActivities: true,
          server: 'server-1'
        })
      })

      getterModule(mockRED)

      assert.notStrictEqual(nodeInstance, null)
      assert.strictEqual(nodeInstance.status.called, true)
    })

    it('should handle dynamic message configuration', function (done) {
      let nodeInstance = null
      let inputHandler = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub().callsFake((event, handler) => {
          if (event === 'input') {
            inputHandler = handler
          }
        })
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.send = sinon.stub()
        nodeInstance = node
      })

      mockRED.nodes.getNode.returns({
        on: sinon.stub(),
        registerForModbus: sinon.stub(),
        queueLog: sinon.stub()
      })

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-7',
          server: 'server-1'
        })
      })

      getterModule(mockRED)

      assert.notStrictEqual(nodeInstance, null)
      assert.notStrictEqual(inputHandler, null)
      assert.strictEqual(nodeInstance.status.called, true)
      done()
    })

    it('should handle server not found - node initializes with waiting status', function () {
      let nodeInstance = null

      mockRED.nodes.createNode.callsFake(function (node, config) {
        Object.assign(node, config)
        node.on = sinon.stub()
        node.removeAllListeners = sinon.stub()
        node.status = sinon.stub()
        node.error = sinon.stub()
        nodeInstance = node
      })

      mockRED.nodes.getNode.returns(null)

      mockRED.nodes.registerType.callsFake(function (name, constructor) {
        const node = {}
        constructor.call(node, {
          id: 'getter-8',
          showStatusActivities: true,
          server: 'non-existent-server'
        })
      })

      getterModule(mockRED)

      assert.notStrictEqual(nodeInstance, null)
      assert.strictEqual(nodeInstance.status.called, true)
      assert.strictEqual(nodeInstance.error.called, false)
    })
  })
})
