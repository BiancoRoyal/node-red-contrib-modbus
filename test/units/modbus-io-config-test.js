/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 **/

'use strict'

const nodeUnderTest = require('../../src/modbus-io-config')
const readNode = require('../../src/modbus-read')
const catchNode = require('@node-red/nodes/core/common/25-catch')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')

const fs = require('fs')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testIoConfigNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const testFlows = require('./flows/modbus-io-config-flows')
const { getPort } = require('../helper/test-helper-extensions')

describe('IO Config node Testing', function () {
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

  describe('Node', function () {
    it('should reload the file when it changes line', (done) => {
      const flow = Array.from(testFlows.testReadWithClientIoFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testIoConfigNodes, flow, function () {
          const modbusIOConfigNode = helper.getNode('b0d101525a3ab7f5')
          let counter = 0
          modbusIOConfigNode.lineReader.on('line', () => {
            counter++
            if (counter === 2) {
              done()
            }
          })
        })
      })
    })

    it('should reload the file when it changes end', (done) => {
      const flow = Array.from(testFlows.testReadWithClientIoFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testIoConfigNodes, flow, function () {
          const modbusIOConfigNode = helper.getNode('b0d101525a3ab7f5')
          let counter = 0

          modbusIOConfigNode.on('updatedConfig', (data) => {
            counter++
            if (data && counter === 1) {
              done()
            }
          })
        })
      })
    })

    it('should log error on lineReader error event', (done) => {
      const flow = Array.from(testFlows.testReadWithClientIoFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testIoConfigNodes, flow, function () {
          const modbusIOConfigNode = helper.getNode('b0d101525a3ab7f5')
          let counter = 0

          modbusIOConfigNode.lineReader.on('error', (data) => {
            counter++
            if (data && counter === 1) {
              done()
            }
          })

          modbusIOConfigNode.lineReader.emit('error', new Error('Test Error'))
        })
      })
    })

    it('should watch the file when it changes', (done) => {
      const flow = Array.from(testFlows.testReadWithClientIoFlow)

      getPort().then((port) => {
        flow[1].serverPort = port
        flow[4].tcpPort = port

        helper.load(testIoConfigNodes, flow, function () {
          const modbusIOConfigNode = helper.getNode('b0d101525a3ab7f5')
          let counter = 0

          modbusIOConfigNode.on('updatedConfig', (data) => {
            counter++
            if (data && counter === 2) { // first from the load and second from watch
              done()
            }
          })

          setTimeout(() => {
            const rawdata = fs.readFileSync('./test/resources/deviceCopy.json')
            fs.writeFileSync('./test/resources/device.json', rawdata)

            setTimeout(() => {
              const rawdata = fs.readFileSync('./test/resources/deviceCopy.json')
              fs.writeFileSync('./test/resources/device.json', rawdata)
            }, 1000)
          }, 1000)
        })
      })
    })

    it('should be loaded', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeLoadedFlow, function () {
        const modbusIOConfigNode = helper.getNode('181cab926ad54b55')
        modbusIOConfigNode.should.have.property('name', 'ModbusIOTest')
        done()
      })
    })

    it('should be loaded while file does not exist', function (done) {
      helper.load(testIoConfigNodes, testFlows.testShouldBeLoadedWithoutFileExistsFlow, function () {
        const modbusIOConfigNode = helper.getNode('181cab926ad54b56')
        modbusIOConfigNode.should.have.property('name', 'ModbusIOTest')
        done()
      })
    })
  })

  describe('post', function () {
    it('should fail for invalid node', function (done) {
      helper.load(testIoConfigNodes, [], function () {
        helper.request().post('/modbus-io-config/invalid').expect(404).end(done)
      })
    })
  })
})
