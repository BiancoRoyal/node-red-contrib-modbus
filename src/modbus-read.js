/**
 Copyright (c) 2016,2017,2018 Klaus Landsdorf (http://bianco-royal.de/)
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
  let mbBasics = require('./modbus-basics')
  let mbCore = require('./core/modbus-core')
  let mbIOCore = require('./core/modbus-io-core')
  let internalDebugLog = require('debug')('contribModbus:read')

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

    let node = this
    let modbusClient = RED.nodes.getNode(config.server)
    modbusClient.registerForModbus(node)
    let delayTimerID = null
    let timerID = null
    let timeoutOccurred = false
    node.INPUT_TIMEOUT_MILLISECONDS = 1000

    mbBasics.setNodeStatusTo('waiting', node)

    node.onModbusInit = function () {
      mbBasics.setNodeStatusTo('initialize', node)
    }

    node.onModbusConnect = function () {
      if (node.delayOnStart) {
        if (!delayTimerID) {
          delayTimerID = setTimeout(node.startIntervalReading, node.INPUT_TIMEOUT_MILLISECONDS * node.startDelayTime)
        } else {
          clearTimeout(delayTimerID)
          delayTimerID = setTimeout(node.startIntervalReading, node.INPUT_TIMEOUT_MILLISECONDS * node.startDelayTime)
        }
      } else {
        if (delayTimerID) {
          clearTimeout(delayTimerID)
        }
        node.startIntervalReading()
      }

      setNodeStatusWithTimeTo('connected')
    }

    node.startIntervalReading = function () {
      if (!timerID) {
        timerID = setInterval(node.modbusPollingRead, mbBasics.calc_rateByUnit(node.rate, node.rateUnit))
      }
    }

    node.onModbusActive = function () {
      setNodeStatusWithTimeTo('active')
    }

    node.onModbusError = function (failureMsg) {
      mbBasics.setNodeStatusTo('failure', node)
      if (timerID) {
        clearInterval(timerID) // clear Timer from events
      }
      timerID = null
      if (node.showErrors) {
        node.warn(failureMsg)
      }
    }

    node.onModbusClose = function () {
      mbBasics.setNodeStatusTo('closed', node)
      if (timerID) {
        clearInterval(timerID) // clear Timer from events
      }
      timerID = null
    }

    node.onModbusBroken = function () {
      mbBasics.setNodeStatusTo('reconnecting after ' + modbusClient.reconnectTimeout + ' msec.', node)
      if (timerID) {
        clearInterval(timerID) // clear Timer from events
      }
      timerID = null
    }

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
    modbusClient.on('mbbroken', node.onModbusBroken)
    modbusClient.on('mbclosed', node.onModbusClose)

    node.modbusPollingRead = function () {
      if (!modbusClient.client) {
        setNodeStatusWithTimeTo('waiting')
        return
      }

      let msg = {
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
      if (timerID) {
        clearInterval(timerID)
      }
      timerID = null
      mbBasics.setNodeStatusTo('closed', node)
      modbusClient.deregisterForModbus(node, done)
    })

    function sendMessage (values, response, msg) {
      if (node.useIOFile && node.ioFile.lastUpdatedAt) {
        if (node.logIOActivities) {
          mbIOCore.internalDebug('node.adr:' + node.adr + ' node.quantity:' + node.quantity)
        }

        let allValueNames = mbIOCore.nameValuesFromIOFile(node, msg, values, response, node.adr)
        let valueNames = mbIOCore.filterValueNames(node, allValueNames, mbCore.functionCodeModbusRead(node.dataType), node.adr, node.quantity)

        let origMsg = {
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

      let statusOptions = mbBasics.setNodeStatusProperties(statusValue, node.showStatusActivities)

      if (statusValue.search('active') !== -1 || statusValue === 'polling') {
        timeoutOccurred = false
        node.status({
          fill: statusOptions.fill,
          shape: statusOptions.shape,
          text: statusOptions.status + getTimeInfo()
        })
      } else {
        node.status({
          fill: statusOptions.fill,
          shape: statusOptions.shape,
          text: statusOptions.status
        })
      }
    }

    function getTimeInfo () {
      return ' ( ' + node.rate + ' ' + mbBasics.get_timeUnit_name(node.rateUnit) + ' ) '
    }
  }

  RED.nodes.registerType('modbus-read', ModbusRead)

  RED.httpAdmin.post('/modbus/read/inject/:id', RED.auth.needsPermission('modbus.inject.write'), function (req, res) {
    let node = RED.nodes.getNode(req.params.id)

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
