/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 Copyright 2016 - Jason D. Harper, Argonne National Laboratory
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc.
 Copyright 2013, 2016 IBM Corp. (node-red)
 All rights reserved.
 node-red-contrib-modbus

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

/**
 * Modbus Read node.
 * @module NodeRedModbusRead
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const mbCore = require('./core/modbus-core')
  const mbIOCore = require('./core/modbus-io-core')
  const internalDebugLog = require('debug')('contribModbus:read')

  function ModbusRead (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.topic = config.topic
    this.unitid = config.unitid

    this.dataType = config.dataType
    this.adr = config.adr
    this.quantity = config.quantity || 1

    this.rate = config.rate
    this.rateUnit = config.rateUnit

    this.delayOnStart = config.delayOnStart
    this.startDelayTime = parseInt(config.startDelayTime) || 10

    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.showWarnings = config.showWarnings
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload
    this.logIOActivities = config.logIOActivities

    this.emptyMsgOnFail = config.emptyMsgOnFail
    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this
    let timeoutOccurred = false
    node.INPUT_TIMEOUT_MILLISECONDS = 1000
    node.statusText = 'waiting'
    node.delayTimerReading = false
    node.intervalTimerIdReading = false
    setNodeStatusWithTimeTo(node.statusText)
    /* istanbul ignore next */
    function verboseWarn (logMessage) {
      if (node.verboseLogging && node.showWarnings) {
        node.warn('Read -> ' + logMessage + ' address: ' + node.adr)
      }
    }
    /* istanbul ignore next */
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
      node.resetAllReadingTimer()
      node.initializeReadingTimer()
    }

    node.onModbusRegister = function () {
      if (node.showStatusActivities) {
        setNodeStatusWithTimeTo('registered')
      }

      if (modbusClient.serialSendingAllowed) {
        node.resetAllReadingTimer()
        node.initializeReadingTimer()
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
      if (modbusClient.reconnectOnTimeout) {
        node.resetAllReadingTimer()
      }

      if (node.showErrors) {
        node.warn(failureMsg)
      }
    }

    node.onModbusClose = function () {
      setNodeStatusWithTimeTo('closed')
      node.resetAllReadingTimer()
    }

    node.onModbusBroken = function () {
      setNodeStatusWithTimeTo('broken')
      if (modbusClient.reconnectOnTimeout) {
        setNodeStatusWithTimeTo('reconnecting after ' + modbusClient.reconnectTimeout + ' msec.')
        node.resetAllReadingTimer()
      }
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

    node.modbusPollingRead = function () {
      if (!modbusClient.client) {
        setNodeStatusWithTimeTo('waiting')
        return
      }

      const msg = {
        topic: node.topic || 'polling',
        from: node.name,
        payload: {
          unitid: node.unitid,
          fc: mbCore.functionCodeModbusRead(node.dataType),
          address: node.adr,
          quantity: node.quantity,
          messageId: mbCore.getObjectId()
        }
      }

      if (node.showStatusActivities) {
        setNodeStatusWithTimeTo('polling')
      }

      modbusClient.emit('readModbus', msg, node.onModbusReadDone, node.onModbusReadError)
    }

    node.resetDelayTimerToRead = function (node) {
      if (node.delayTimerReading) {
        /* istanbul ignore next */
        verboseWarn('resetDelayTimerToRead node ' + node.id)
        clearTimeout(node.delayTimerReading)
      }
      node.delayTimerReading = null
    }

    node.resetIntervalToRead = function (node) {
      if (node.intervalTimerIdReading) {
        /* istanbul ignore next */
        verboseWarn('resetIntervalToRead node ' + node.id)
        clearInterval(node.intervalTimerIdReading)
      }
      node.intervalTimerIdReading = null
    }

    node.resetAllReadingTimer = function () {
      node.resetDelayTimerToRead(node)
      node.resetIntervalToRead(node)
    }

    node.resetAllReadingTimer()

    node.startIntervalReading = function () {
      if (!node.intervalTimerIdReading) {
        /* istanbul ignore next */
        verboseWarn('startIntervalReading node ' + node.id)
        node.intervalTimerIdReading = setInterval(node.modbusPollingRead, mbBasics.calc_rateByUnit(node.rate, node.rateUnit))
      }
    }

    node.initializeReadingTimer = function () {
      node.resetAllReadingTimer()
      if (node.delayOnStart) {
        /* istanbul ignore next */
        verboseWarn('initializeReadingTimer delay timer node ' + node.id)
        node.delayTimerReading = setTimeout(node.startIntervalReading, node.INPUT_TIMEOUT_MILLISECONDS * node.startDelayTime)
      } else {
        node.startIntervalReading()
      }
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
      /* istanbul ignore next */
      verboseWarn('close node ' + node.id)
      modbusClient.deregisterForModbus(node.id, done)
    })

    function sendMessage (values, response, msg) {
      const topic = msg.topic || node.topic
      if (node.useIOFile && node.ioFile.lastUpdatedAt) {
        if (node.logIOActivities) {
          mbIOCore.internalDebug('node.adr:' + node.adr + ' node.quantity:' + node.quantity)
        }

        const allValueNames = mbIOCore.nameValuesFromIOFile(node, msg, values, response, node.adr)
        const valueNames = mbIOCore.filterValueNames(node, allValueNames, mbCore.functionCodeModbusRead(node.dataType), node.adr, node.quantity)

        const origMsg = {
          topic,
          responseBuffer: response,
          input: msg,
          sendingNodeId: node.id
        }

        if (node.useIOForPayload) {
          origMsg.payload = valueNames
          origMsg.values = values
        } else {
          origMsg.payload = values
          origMsg.valueNames = valueNames
        }

        node.send([
          origMsg,
          {
            topic,
            payload: response,
            values,
            input: msg,
            valueNames,
            sendingNodeId: node.id
          }])
      } else {
        node.send([
          {
            topic,
            payload: values,
            responseBuffer: response,
            input: msg,
            sendingNodeId: node.id
          },
          {
            topic,
            payload: response,
            values,
            input: msg,
            sendingNodeId: node.id
          }
        ])
      }
    }

    function setNodeStatusWithTimeTo (statusValue) {
      if (statusValue === 'polling' && timeoutOccurred) {
        return
      }

      const statusOptions = mbBasics.setNodeStatusProperties(statusValue, node.showStatusActivities)
      const statusText = node.statusText

      if (statusValue.search('active') !== -1 || statusValue === 'polling') {
        const newStatusText = statusOptions.status + getTimeInfo()
        timeoutOccurred = false
        if (newStatusText !== statusText) {
          node.status({
            fill: statusOptions.fill,
            shape: statusOptions.shape,
            text: newStatusText
          })
        }
      } else {
        const newStatusText = statusOptions.status
        if (newStatusText !== statusText) {
          node.status({
            fill: statusOptions.fill,
            shape: statusOptions.shape,
            text: newStatusText
          })
        }
      }
    }

    function getTimeInfo () {
      return ' ( ' + node.rate + ' ' + mbBasics.get_timeUnit_name(node.rateUnit) + ' ) '
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

  RED.nodes.registerType('modbus-read', ModbusRead)

  RED.httpAdmin.post('/modbus/read/inject/:id', RED.auth.needsPermission('modbus.inject.write'), function (req, res) {
    const node = RED.nodes.getNode(req.params.id)

    if (node) {
      try {
        node.modbusPollingRead()
        res.sendStatus(200)
      } catch (err) {
        res.sendStatus(500)
        node.error(RED._('modbusinject.failed', { error: err.toString() }))
      }
    } else {
      res.sendStatus(404)
    }
  })
}
