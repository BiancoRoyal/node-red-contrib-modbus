/**
 Copyright (c) 2016,2017, Klaus Landsdorf (http://bianco-royal.de/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

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
  let internalDebugLog = require('debug')('node_red_contrib_modbus')

  function ModbusQueueInfo (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.unitid = parseInt(config.unitid)
    this.lowLowLevel = parseInt(config.lowLowLevel)
    this.lowLevel = parseInt(config.lowLevel)
    this.highLevel = parseInt(config.highLevel)
    this.highHighLevel = parseInt(config.highHighLevel)
    this.errorOnHighLevel = config.errorOnHighLevel

    let node = this

    let modbusClient = RED.nodes.getNode(config.server)

    node.queueReadInterval = null

    if (RED.settings.verbose) {
      internalDebugLog.enabled = true
    }

    setNodeStatusTo('waiting')

    node.resetStates = function () {
      node.lowLowLevelReached = true
      node.lowLevelReached = false
      node.highLevelReached = false
      node.highHighLevelReached = false
    }

    node.resetStates()

    node.readFromQueue = function () {
      let unit = node.unitid || 1

      if (modbusClient.bufferCommands) {
        if (unit < 0 || unit > 255) {
          unit = 1
        }

        let items = modbusClient.bufferCommandList.get(unit).length

        if (!items || (!node.lowLowLevelReached && items < node.lowLowLevel)) {
          node.resetStates()
        }

        if (!node.lowLevelReached && items > node.lowLowLevel && items < node.lowLevel) {
          node.lowLevelReached = true
          internalDebugLog({
            payload: Date.now(),
            state: 'low level reached',
            unitid: unit,
            items: items
          })
        }

        if (!node.highLevelReached && items > node.lowLevel && items > node.highLevel) {
          node.highLevelReached = true

          if (node.errorOnHighLevel) {
            node.error('Queue High Level Reached', {
              payload: Date.now(),
              state: 'high level reached',
              unitid: unit,
              highLevel: node.highLevel,
              items: items
            })
          } else {
            node.warn({
              payload: Date.now(),
              state: 'high level reached',
              unitid: unit,
              highLevel: node.highLevel,
              items: items
            })
          }
        }

        if (!node.highHighLevelReached && items > node.highLevel && items > node.highHighLevel) {
          node.highHighLevelReached = true
          node.error('Queue High High Level Reached', {
            payload: Date.now(),
            state: 'high high level reached',
            unitid: unit,
            highLevel: node.highLevel,
            highHighLevel: node.highHighLevel,
            items: items
          })
        }

        let fillColor = 'blue'
        if (node.lowLevelReached) {
          fillColor = 'green'
        }

        if (node.highLevelReached) {
          if (node.errorOnHighLevel) {
            fillColor = 'red'
          } else {
            fillColor = 'yellow'
          }
        }

        if (node.highHighLevelReached) {
          fillColor = 'red'
        }

        node.status({
          fill: fillColor,
          shape: 'ring',
          text: 'active unit ' + unit + ' queue items: ' + items
        })
      } else {
        setNodeStatusTo('active unit ' + unit + ' without queue')
      }
    }

    node.onModbusInit = function () {
      node.readFromQueue()
    }

    node.onModbusActive = function () {
      node.readFromQueue()
    }

    node.onModbusQueue = function () {
      node.readFromQueue()
    }

    modbusClient.on('mbinit', node.onModbusInit)
    modbusClient.on('mbqueue', node.onModbusQueue)
    modbusClient.on('mbactive', node.onModbusActive)

    node.queueReadInterval = setInterval(node.readFromQueue, 1000)

    node.on('input', function (msg) {
      msg.queueEnabled = modbusClient.bufferCommands

      if (Number.isInteger(node.unitid)) {
        msg.queue = modbusClient.bufferCommandList.get(node.unitid)
        msg.unitid = node.unitid
      } else {
        msg.queues = modbusClient.bufferCommandList
      }

      if (msg &&
        msg.resetQueue &&
        modbusClient.bufferCommands) {
        modbusClient.initQueue()
        modbusClient.warn('Init Queue By External Node')
        node.resetStates()
        node.status({
          fill: 'blue',
          shape: 'ring',
          text: 'active empty unit queue'
        })
      }

      node.send(msg)
    })

    node.on('close', function () {
      setNodeStatusTo('closed')
      if (node.queueReadInterval) {
        clearInterval(node.queueReadInterval)
      }
      node.queueReadInterval = null
    })

    function setNodeStatusTo (statusValue) {
      node.status({
        fill: 'green',
        shape: 'ring',
        text: statusValue
      })
    }
  }

  RED.nodes.registerType('modbus-queue-info', ModbusQueueInfo)
}
