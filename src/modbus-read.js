/**
 Copyright (c) 2016,2017,2018,2019,2020 Klaus Landsdorf (https://bianco-royal.com/)
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
    this.connection = null

    this.useIOFile = config.useIOFile
    this.ioFile = RED.nodes.getNode(config.ioFile)
    this.useIOForPayload = config.useIOForPayload
    this.logIOActivities = config.logIOActivities

    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this
    let delayTimerID = null
    let intervalTimerId = null
    let timeoutOccurred = false
    node.modbusReadNodeInit = true
    node.INPUT_TIMEOUT_MILLISECONDS = 1000
    node.statusText = 'waiting'
    setNodeStatusWithTimeTo(node.statusText)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }
    modbusClient.registerForModbus(node)

    node.onModbusInit = function () {
      setNodeStatusWithTimeTo('initialized')
    }

    node.initializeReadingTimer = function () {
      node.modbusReadNodeInit = false
      if (node.delayOnStart) {
        if (delayTimerID) {
          clearTimeout(delayTimerID)
        }
        delayTimerID = setTimeout(node.startIntervalReading, node.INPUT_TIMEOUT_MILLISECONDS * node.startDelayTime)
      } else {
        if (delayTimerID) {
          clearTimeout(delayTimerID)
        }
        node.startIntervalReading()
      }
    }

    node.onModbusConnect = function () {
      node.initializeReadingTimer()
      setNodeStatusWithTimeTo('connected')
    }

    node.startIntervalReading = function () {
      node.resetIntervalToRead()
      if (!intervalTimerId) {
        intervalTimerId = setInterval(node.modbusPollingRead, mbBasics.calc_rateByUnit(node.rate, node.rateUnit))
      }
    }

    node.onModbusActive = function () {
      if (node.modbusReadNodeInit) {
        node.initializeReadingTimer() // partial deploys
      }
      setNodeStatusWithTimeTo('active')
    }

    node.onModbusQueue = function () {
      setNodeStatusWithTimeTo('queue')
    }

    node.onModbusError = function (failureMsg) {
      setNodeStatusWithTimeTo('failure')
      if (modbusClient.reconnectOnTimeout) {
        node.resetIntervalToRead()
      }
      if (node.showErrors) {
        node.warn(failureMsg)
      }
    }

    node.onModbusClose = function () {
      setNodeStatusWithTimeTo('closed')
      node.resetIntervalToRead()
    }

    node.resetIntervalToRead = function () {
      if (intervalTimerId) {
        clearInterval(intervalTimerId)
      }
      intervalTimerId = null
    }

    node.onModbusBroken = function () {
      setNodeStatusWithTimeTo('broken')
      if (modbusClient.reconnectOnTimeout) {
        setNodeStatusWithTimeTo('reconnecting after ' + modbusClient.reconnectTimeout + ' msec.')
        node.resetIntervalToRead()
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

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusWithTimeTo('reading done')
      }

      sendMessage(resp.data, resp, msg)
    }

    node.onModbusReadError = function (err, msg) {
      internalDebugLog(err.message)
      if (node.showErrors) {
        node.error(err, msg)
      }
      mbBasics.setModbusError(node, modbusClient, err, msg)
    }

    node.on('close', function (done) {
      node.resetIntervalToRead()
      setNodeStatusWithTimeTo('closed')
      modbusClient.deregisterForModbus(node.id, done)
    })

    function sendMessage (values, response, msg) {
      if (node.useIOFile && node.ioFile.lastUpdatedAt) {
        if (node.logIOActivities) {
          mbIOCore.internalDebug('node.adr:' + node.adr + ' node.quantity:' + node.quantity)
        }

        const allValueNames = mbIOCore.nameValuesFromIOFile(node, msg, values, response, node.adr)
        const valueNames = mbIOCore.filterValueNames(node, allValueNames, mbCore.functionCodeModbusRead(node.dataType), node.adr, node.quantity)

        const origMsg = {
          topic: msg.topic,
          responseBuffer: response,
          input: msg
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
            payload: response,
            values: values,
            input: msg,
            valueNames: valueNames
          }])
      } else {
        node.send([
          {
            payload: values,
            responseBuffer: response,
            input: msg
          },
          {
            payload: response,
            values: values,
            input: msg
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
