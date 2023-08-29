/**
 Copyright (c) 2016,2017,2018,2019,2020,2021,2022 Klaus Landsdorf (http://node-red.plus/)
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

    const node = this
    node.statusText = 'waiting'
    setNodeStatusWithTimeTo(node.statusText)

    function verboseWarn (logMessage) {
      if (RED.settings.verbose && node.showWarnings) {
        node.warn('Read -> ' + logMessage + ' address: ' + node.adr)
      }
    }

    verboseWarn('open node ' + node.id)
    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
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

    this.on('close', function (done) {
      node.resetAllReadingTimer()
      node.removeNodeListenerFromModbusClient()
      setNodeStatusWithTimeTo('closed')
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

  RED.httpAdmin.post('/modbus/fc/si/:id', RED.auth.needsPermission('modbus.read'), function (req, res) {
    const fs = require('fs')
    const path = require('node:path')
    const filapath = req.body.mapPath || './extras/argumentMaps/defaults/'
    const filename = 'codes.json'
    if (!fs.existsSync(path.resolve(filapath, filename))) {
      return
    }

    fs.readFile(path.resolve(filapath, filename), (error, data) => {
      if (error) res.json([error])

      res.json(JSON.parse(data))
    })
  })
}
