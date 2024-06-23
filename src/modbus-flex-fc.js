/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 Copyright 2016 - Jason D. Harper, Argonne National Laboratory
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc.
 All rights reserved.
 node-red-contrib-modbus
 **/

/**
 * Modbus Custom Function Code.
 * @module NodeRedModbusFlexFc
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const internalDebugLog = require('debug')('contribModbus:read')

  function ModbusFlexFc (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.topic = config.topic
    this.unitid = config.unitid

    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings
    this.connection = null

    this.emptyMsgOnFail = config.emptyMsgOnFail
    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    this.fc = config.fc
    this.requestCard = config.requestCard
    this.responseCard = config.responseCard

    // __WARN__: These properties are for testing the Node and they should not be used in the Code directly!
    // NOTE(Kay): We cache the verbosity level of the RED object to make verboseWarn testable!
    this.environmentVerbosity = RED.settings.verbose

    const node = this
    node.statusText = 'waiting'
    setNodeStatusWithTimeTo(node.statusText)
    /* istanbul ignore next */
    function verboseWarn (logMessage) {
      if (node.environmentVerbosity && node.showWarnings) {
        node.warn('Read -> ' + logMessage + ' address: ' + node.adr)
      }
    }
    /* istanbul ignore next */
    verboseWarn('open node ' + node.id)
    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }

    node.isReadyForInput = function () {
      return (modbusClient.client && modbusClient.isActive())
    }

    node.isNotReadyForInput = function () {
      return !node.isReadyForInput()
    }

    node.onModbusInit = function () {
      setNodeStatusWithTimeTo('initialized')
    }

    node.onModbusConnect = function () {
      setNodeStatusWithTimeTo('connected')
      node.modbusRead()
    }

    node.onModbusRegister = function () {
      if (node.showStatusActivities) {
        setNodeStatusWithTimeTo('registered')
      }

      if (modbusClient.serialSendingAllowed) {
        setNodeStatusWithTimeTo('connected')
      }
    }

    node.onModbusActive = function () {
      setNodeStatusWithTimeTo('active')
    }

    node.onModbusQueue = function () {
      setNodeStatusWithTimeTo('queue')
    }

    node.onModbusError = function (failureMsg) {
      setNodeStatusWithTimeTo('failure')
      if (node.showErrors) {
        node.warn(failureMsg)
      }
    }

    node.onModbusClose = function () {
      setNodeStatusWithTimeTo('closed')
    }

    node.onModbusBroken = function () {
      setNodeStatusWithTimeTo('broken')
    }

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusWithTimeTo('reading done')
      }
      sendMessage(resp.data, resp, msg)
    }

    node.errorProtocolMsg = function (err, msg) {
      if (node.showErrors) {
        mbBasics.logMsgError(node, err, msg)
      }
    }

    node.onModbusReadError = function (err, msg) {
      node.internalDebugLog(err.message)
      node.errorProtocolMsg(err, msg)
      mbBasics.sendEmptyMsgOnFail(node, err, msg)
      mbBasics.setModbusError(node, modbusClient, err, msg)
    }

    node.modbusRead = function () {
      if (!modbusClient.client) {
        setNodeStatusWithTimeTo('waiting')
        return
      }

      const msg = {
        topic: 'customFc',
        from: node.name,
        payload: {
          unitid: parseInt(node.unitid),
          fc: parseInt(node.fc, 16),
          requestCard: node.requestCard,
          responseCard: node.responseCard,
          messageId: mbCore.getObjectId()
        }
      }

      if (node.showStatusActivities) {
        setNodeStatusWithTimeTo('reading')
      }

      modbusClient.emit('customModbusMessage', msg, node.onModbusReadDone, node.onModbusReadError)
    }

    node.removeNodeListenerFromModbusClient = function () {
      modbusClient.removeListener('mbinit', node.onModbusInit)
      modbusClient.removeListener('mbqueue', node.onModbusQueue)
      modbusClient.removeListener('mbconnected', node.onModbusConnect)
      modbusClient.removeListener('mbactive', node.onModbusActive)
      modbusClient.removeListener('mberror', node.onModbusError)
      modbusClient.removeListener('mbclosed', node.onModbusClose)
      modbusClient.removeListener('mbbroken', node.onModbusBroken)
      modbusClient.removeListener('mbregister', node.onModbusRegister)
      modbusClient.removeListener('mbderegister', node.onModbusClose)
    }

    node.isValidCustomFc = function (origMsgInput) {
      return origMsgInput.payload &&
        origMsgInput.topic === 'customFc' &&
        origMsgInput.payload.unitid &&
        origMsgInput.payload.fc &&
        origMsgInput.payload.requestCard &&
        origMsgInput.payload.responseCard
    }

    node.buildNewMessageObject = function (origMsgInput) {
      return (node.isValidCustomFc(origMsgInput))
        ? origMsgInput
        : {
            topic: 'customFc',
            payload: {
              unitid: parseInt(node.unitid),
              fc: parseInt(node.fc, 16),
              requestCard: node.requestCard,
              responseCard: node.responseCard,
              from: node.name
            }
          }
    }

    node.on('input', function (msg) {
      /* istanbul ignore next */
      if (mbBasics.invalidPayloadIn(msg)) {
        verboseWarn('Invalid message on input.')
        return
      }
      /* istanbul ignore next */
      if (node.isNotReadyForInput()) {
        verboseWarn('Inject while node is not ready for input.')
        return
      }
      /* istanbul ignore next */
      if (modbusClient.isInactive()) {
        verboseWarn('You sent an input to inactive client. Please use initial delay on start or send data more slowly.')
        return
      }

      const origMsgInput = Object.assign({}, msg) // keep it origin
      try {
        // const newMsg = node.buildNewMessageObject(node, origMsgInput)

        const msgToSend = node.buildNewMessageObject(origMsgInput)

        msgToSend.payload.messageId = mbCore.getObjectId()

        modbusClient.emit('customModbusMessage', msgToSend, node.onModbusReadDone, node.onModbusReadError)

        if (node.showStatusActivities) {
          mbBasics.setNodeStatusTo(modbusClient.actualServiceState, node)
        }
      } catch (err) {
        node.errorProtocolMsg(err, origMsgInput)
        mbBasics.sendEmptyMsgOnFail(node, err, origMsgInput)
      }
    })

    this.on('close', function (done) {
      // TODO
      // node.resetAllReadingTimer()
      node.removeNodeListenerFromModbusClient()
      setNodeStatusWithTimeTo('closed')
      /* istanbul ignore next */
      verboseWarn('close node ' + node.id)
      modbusClient.deregisterForModbus(node.id, done)
    })

    function sendMessage (values, response, msg) {
      const topic = msg.topic || node.topic

      node.send({
        topic,
        payload: response,
        input: msg,
        sendingNodeId: node.id
      })
    }

    function setNodeStatusWithTimeTo (statusValue) {
      const statusOptions = mbBasics.setNodeStatusProperties(statusValue, node.showStatusActivities)
      const statusText = node.statusText

      const newStatusText = statusOptions.status
      if (newStatusText !== statusText) {
        node.statusText = newStatusText
        node.status({
          fill: statusOptions.fill,
          shape: statusOptions.shape,
          text: newStatusText
        })
      }
    }

    if (node.showStatusActivities) {
      modbusClient.on('mbinit', node.onModbusInit)
      modbusClient.on('mbqueue', node.onModbusQueue)
    }

    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
    modbusClient.on('mbclosed', node.onModbusClose)
    modbusClient.on('mbbroken', node.onModbusBroken)
    modbusClient.on('mbregister', node.onModbusRegister)
    modbusClient.on('mbderegister', node.onModbusClose)

    modbusClient.registerForModbus(node)
  }

  RED.nodes.registerType('modbus-flex-fc', ModbusFlexFc)

  RED.httpAdmin.post('/modbus/fc/:id', RED.auth.needsPermission('modbus.read'), function (req, res) {
    const fs = require('fs')
    const path = require('node:path')

    const mapPath = req.body.mapPath

    if (req.body.mapPath) {
      if (req.body.mapPath.endsWith('.json') === false) {
        res.status(400).json({ code: 400, message: 'ERROR: Invalid file extension' })
        return
      }
    }

    const filepath = mapPath || './extras/argumentMaps/defaults/codes.json'
    const resolvedPath = path.resolve(filepath)

    fs.readFile(resolvedPath, (error, data) => {
      let response = {}
      if (error) {
        response = { code: 404, message: 'ERROR: File not found' }
      } else {
        try {
          response.message = JSON.parse(data)
          response.code = 200
        } catch (error) {
          response = { code: 500, message: 'ERROR: File contains invalid JSON' }
        }
      }
      res.status(response.code).json(response.message)
    })
  })
}
