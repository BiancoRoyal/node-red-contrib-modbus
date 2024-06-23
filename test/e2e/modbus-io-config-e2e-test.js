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

const nodeUnderTest = require('../../src/modbus-io-config.js')
const readNode = require('../../src/modbus-read.js')
const catchNode = require('@node-red/nodes/core/common/25-catch')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const functionNode = require('@node-red/nodes/core/function/10-function')
const clientNode = require('../../src/modbus-client')
const serverNode = require('../../src/modbus-server')
const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const testIoConfigNodes = [catchNode, injectNode, functionNode, clientNode, serverNode, nodeUnderTest, readNode]

const coreIO = require('../../src/core/modbus-io-core.js')

describe('IO Config E2E Testing', function () {
  let sinonStub

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
    }).finally(function () {
      if (sinonStub) {
        sinonStub.restore()
      }
    })
  })

  after(function (done) {
    helper.stopServer(function () {
      done()
    })
  })

  describe('IO Node testing', function () {
    it('should handle end of lineReader', function (done) {
      const flow = [
        {
          id: 'c1d2e3f4g5h6i7',
          type: 'modbus-io-config',
          name: 'ModbusIOConfig',
          path: 'testpath',
          format: 'utf8',
          addressOffset: ''
        }
      ]

      const mockConfigData = [{ key: 'value' }]

      sinonStub = sinon.stub(coreIO, 'LineByLineReader').callsFake(function (path) {
        this.on = function (event, callback) {
          if (event === 'line') {
            callback(JSON.stringify(mockConfigData[0]))
          } else if (event === 'end') {
            callback()
          }
        }
        this.resume = () => { }
      })

      // sinonDebugStub = sinon.spy(coreIO, 'internalDebug')
      const warnSpy = sinon.spy()
      const emitSpy = sinon.spy()

      helper.load(testIoConfigNodes, flow, function () {
        const configNode = helper.getNode('c1d2e3f4g5h6i7')
        configNode.warn = warnSpy
        configNode.emit = emitSpy

        const lineReader = new coreIO.LineByLineReader(configNode.path)
        lineReader.on('line', () => { })
        lineReader.on('end', () => { })

        try {
          /* eslint-disable no-unused-expressions */
          expect(configNode.lastUpdatedAt).to.be.null
          // expect(sinonDebugStub.calledWith('Read IO Done From File ' + configNode.path)).to.be.true
          expect(warnSpy.calledOnce).to.be.false
          expect(emitSpy.calledOnce).to.be.false
          expect(emitSpy.calledWith('updatedConfig', configNode.configData)).to.be.false
          done()
        } catch (err) {
          done(err)
        } finally {
          coreIO.LineByLineReader.restore()
          coreIO.internalDebug.restore()
        }
      })
    })
  })
})
