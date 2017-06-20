/**
 Copyright 2016,2017 - Klaus Landsdorf (http://bianco-royal.de/)
 Copyright 2016 - Jason D. Harper, Argonne National Laboratory
 Copyright 2015,2016 - Mika Karaila, Valmet Automation Inc.
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
  let mbBasics = require('./modbus-basics')
  let internalDebugLog = require('debug')('node_red_contrib_modbus')

  function ModbusRead (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.unitid = config.unitid

    this.dataType = config.dataType
    this.adr = config.adr
    this.quantity = config.quantity

    this.rate = config.rate
    this.rateUnit = config.rateUnit
    this.showStatusActivities = config.showStatusActivities
    this.showErrors = config.showErrors
    this.connection = null

    let node = this
    let modbusClient = RED.nodes.getNode(config.server)
    let timerID = null
    let timeoutOccurred = false

    setNodeStatusTo('waiting')

    node.onModbusInit = function () {
      setNodeStatusTo('initialize')
    }

    node.onModbusConnect = function () {
      if (!timerID) {
        timerID = setInterval(node.modbusPollingRead, mbBasics.calc_rateByUnit(node.rate, node.rateUnit))
      }
      setNodeStatusTo('connected')
    }

    node.onModbusActive = function () {
      setNodeStatusTo('active')
    }

    node.onModbusError = function (failureMsg) {
      setNodeStatusTo('failure')
      if (timerID) {
        clearInterval(timerID) // clear Timer from events
      }
      timerID = null
      if (node.showErrors) {
        node.warn(failureMsg)
      }
    }

    node.onModbusClose = function () {
      setNodeStatusTo('closed')
      if (timerID) {
        clearInterval(timerID) // clear Timer from events
      }
      timerID = null
    }

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbconnected', node.onModbusConnect)
    modbusClient.on('mbactive', node.onModbusActive)
    modbusClient.on('mberror', node.onModbusError)
    modbusClient.on('mbclosed', node.onModbusClose)

    node.modbusPollingRead = function () {
      if (!modbusClient.client) {
        setNodeStatusTo('waiting')
        return
      }

      let msg = {
        topic: 'polling',
        from: node.name,
        payload: {
          unitid: node.unitid,
          fc: node.functionCodeModbus(node.dataType),
          address: node.adr,
          quantity: node.quantity
        }
      }

      if (node.showStatusActivities) {
        setNodeStatusTo('polling')
        verboseLog(JSON.toString(msg))
      }

      modbusClient.emit('readModbus', msg, node.onModbusReadDone, node.onModbusReadError)
    }

    node.functionCodeModbus = function (dataType) {
      switch (dataType) {
        case 'Coil':
          return 1
        case 'Input':
          return 2
        case 'HoldingRegister':
          return 3
        case 'InputRegister':
          return 4
        default:
          return dataType
      }
    }

    node.onModbusReadDone = function (resp, msg) {
      if (node.showStatusActivities) {
        setNodeStatusTo('reading done')
        verboseLog('reading done -> ' + JSON.stringify(msg))
      }

      node.send(buildMessage(resp.data, resp, msg))
    }

    node.onModbusReadError = function (err, msg) {
      setModbusError(err, msg)
    }

    node.on('close', function () {
      if (timerID) {
        clearInterval(timerID)
      }
      timerID = null
      setNodeStatusTo('closed')
    })

    function verboseLog (logMessage) {
      if (RED.settings.verbose) {
        internalDebugLog(logMessage)
      }
    }

    function buildMessage (values, response, msg) {
      return [{payload: values, responseBuffer: response, input: msg}, {payload: response, values: values, input: msg}]
    }

    function setNodeStatusTo (statusValue) {
      if (statusValue === 'polling' && timeoutOccurred) {
        return
      }

      let statusOptions = mbBasics.set_node_status_properties(statusValue, node.showStatusActivities)

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

    function setModbusError (err, msg) {
      let working = false

      if (err) {
        switch (err.message) {
          case 'Timed out':
            timeoutOccurred = true
            setNodeStatusTo('timeout')
            working = true
            break
          case 'FSM Not Ready To Read':
            setNodeStatusTo('not ready to read')
            working = true
            break
          case 'Port Not Open':
            setNodeStatusTo('reconnect')
            modbusClient.emit('reconnect')
            working = true
            break
          default:
            setNodeStatusTo('error: ' + JSON.stringify(err))
            if (node.showErrors) {
              node.error(err, msg)
            }
        }
      }
      return working
    }
  }

  RED.nodes.registerType('modbus-read', ModbusRead)
}
