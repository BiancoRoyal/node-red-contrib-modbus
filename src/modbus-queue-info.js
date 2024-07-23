/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

/**
 * Modbus Queue Info node.
 * @module NodeRedModbusQueueInfo
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const mbBasics = require('./modbus-basics')
  const coreModbusQueue = require('./core/modbus-queue-core')
  const internalDebugLog = require('debug')('contribModbus:queue')

  function ModbusQueueInfo (config) {
    RED.nodes.createNode(this, config)

    const { name, topic, unitid, lowLowLevel, lowLevel, highLevel, highHighLevel, errorOnHighLevel, queueReadIntervalTime, showStatusActivities, updateOnAllQueueChanges, updateOnAllUnitQueues } = config
    this.name = name
    this.topic = topic
    this.unitid = parseInt(unitid) || 1
    this.lowLowLevel = parseInt(lowLowLevel)
    this.lowLevel = parseInt(lowLevel)
    this.highLevel = parseInt(highLevel)
    this.highHighLevel = parseInt(highHighLevel)
    this.errorOnHighLevel = errorOnHighLevel
    this.queueReadIntervalTime = queueReadIntervalTime || 1000
    this.showStatusActivities = showStatusActivities
    this.updateOnAllQueueChanges = updateOnAllQueueChanges
    this.updateOnAllUnitQueues = updateOnAllUnitQueues

    this.internalDebugLog = internalDebugLog

    const node = this
    node.queueReadInterval = null
    node.updateStatusRunning = false
    node.unitsWithQueue = new Map()
    mbBasics.setNodeStatusTo('waiting', node)

    const modbusClient = RED.nodes.getNode(config.server)
    if (!modbusClient) {
      return
    }
    modbusClient.registerForModbus(node)

    node.initUnitQueueStates = function () {
      for (let unit = 0; unit < 256; unit += 1) {
        node.unitsWithQueue.set(unit, {})
        node.resetStates(unit)
      }
    }

    node.resetStates = function (unit) {
      const unitWithQueue = node.unitsWithQueue.has(unit) ? node.unitsWithQueue.get(unit) : {}
      unitWithQueue.lowLowLevelReached = true
      unitWithQueue.lowLevelReached = false
      unitWithQueue.highLevelReached = false
      unitWithQueue.highHighLevelReached = false
    }

    node.errorProtocolMsg = function (err, msg) {
      if (node.showErrors) {
        mbBasics.logMsgError(node, err, msg)
      }
    }
    node.initUnitQueueStates()

    node.checkLowLevelReached = function (node, bufferCommandListLength, unit) {
      const unitWithQueue = node.unitsWithQueue.get(unit)
      if (!unitWithQueue.lowLevelReached && bufferCommandListLength > node.lowLowLevel && bufferCommandListLength < node.lowLevel) {
        unitWithQueue.lowLevelReached = true
        const msg = {
          payload: Date.now(),
          topic: node.topic,
          state: 'low level reached',
          unitid: unit,
          modbusClientName: modbusClient.name,
          bufferCommandListLength
        }
        node.send(msg)
      }
    }

    node.checkHighLevelReached = function (node, bufferCommandListLength, unit) {
      const unitWithQueue = node.unitsWithQueue.get(unit)
      if (!unitWithQueue.highLevelReached &&
        bufferCommandListLength > node.lowLevel &&
        bufferCommandListLength > node.highLevel) {
        unitWithQueue.highLevelReached = true
        const msg = {
          payload: Date.now(),
          topic: node.topic,
          state: 'high level reached',
          unitid: unit,
          modbusClientName: modbusClient.name || modbusClient.id,
          highLevel: node.highLevel,
          bufferCommandListLength
        }

        if (node.errorOnHighLevel) {
          node.error(new Error('Queue High Level Reached'), msg)
        } else {
          node.warn(msg)
        }

        node.send(msg)
      }
    }

    node.checkHighHighLevelReached = function (node, bufferCommandListLength, unit) {
      const unitWithQueue = node.unitsWithQueue.get(unit)
      if (!unitWithQueue.highHighLevelReached &&
        bufferCommandListLength > node.highLevel &&
        bufferCommandListLength > node.highHighLevel) {
        unitWithQueue.highHighLevelReached = true
        const msg = {
          payload: Date.now(),
          topic: node.topic,
          state: 'high high level reached',
          unitid: unit,
          modbusClientName: modbusClient.name || modbusClient.id,
          highLevel: node.highLevel,
          highHighLevel: node.highHighLevel,
          bufferCommandListLength
        }
        node.error(new Error('Queue High High Level Reached'), msg)
        node.send(msg)
      }
    }

    node.getStatusSituationFillColor = function (unit) {
      const unitWithQueue = node.unitsWithQueue.get(unit)
      let fillColor = 'blue'

      switch (true) {
        case unitWithQueue.lowLevelReached:
          fillColor = 'green'
          break
        case unitWithQueue.highLevelReached:
          if (node.errorOnHighLevel) {
            fillColor = 'red'
          } else {
            fillColor = 'yellow'
          }
          break
        case unitWithQueue.highHighLevelReached:
          fillColor = 'red'
          break
      }

      return fillColor
    }

    node.setNodeStatusByActivity = function (bufferCommandListLength, unit) {
      if (node.showStatusActivities) {
        node.status({
          fill: node.getStatusSituationFillColor(node.unitid),
          shape: 'ring',
          text: (bufferCommandListLength) ? `active unit ${unit} queue items: ${bufferCommandListLength}` : `active (Unit-Id: ${unit}) empty`
        })
      }
    }

    node.readFromQueue = async function () {
      if (node.updateStatusRunning) {
        return
      }
      const unit = ((node.unitid < 1 || node.unitid > 255)) ? 1 : node.unitid
      if (modbusClient.bufferCommands) {
        try {
          node.updateStatusRunning = true
          const bufferCommandListLength = modbusClient.bufferCommandList.get(unit).length
          node.checkQueueStates(bufferCommandListLength, unit)
          node.setNodeStatusByActivity(bufferCommandListLength, unit)
          node.updateStatusRunning = false
        } catch (err) {
          node.updateStatusRunning = false
          throw err
        }
      } else {
        if (node.showStatusActivities) {
          node.setNodeStatusByActivity(null, unit)
        }
      }
    }

    node.checkQueueStates = function (bufferCommandListLength, unit) {
      const unitWithQueue = node.unitsWithQueue.get(unit)
      if (!unitWithQueue.lowLowLevelReached && bufferCommandListLength < node.lowLowLevel) {
        node.resetStates(unit)
      }
      node.checkLowLevelReached(node, bufferCommandListLength, unit)
      node.checkHighLevelReached(node, bufferCommandListLength, unit)
      node.checkHighHighLevelReached(node, bufferCommandListLength, unit)
    }

    node.readFromAllUnitQueues = function () {
      if (node.updateStatusRunning) {
        return
      }

      if (modbusClient.bufferCommands) {
        return new Promise(
          function (resolve, reject) {
            try {
              node.updateStatusRunning = true
              let bufferCommandListLength = 0
              for (let unit = 0; unit < 256; unit += 1) {
                bufferCommandListLength = modbusClient.bufferCommandList.get(unit).length
                if (!bufferCommandListLength) {
                  continue
                }
                node.checkQueueStates(bufferCommandListLength, unit)
              }
              node.updateStatusRunning = false
              resolve()
            } catch (err) {
              node.updateStatusRunning = false
              reject(err)
            }
          })
      }
    }

    node.registerModbusQueueActionsToNode = function (eventCallback) {
      if (node.updateOnAllQueueChanges) { // much more CPU-Load on many parallel requests to the client
        modbusClient.on('mbqueue', eventCallback) // en-queue
      }
      modbusClient.on('mbactive', eventCallback) // de-queue
      modbusClient.on('mbinit', eventCallback)
      modbusClient.on('mbconnected', eventCallback)
      modbusClient.on('mberror', eventCallback)
      modbusClient.on('mbclosed', eventCallback)
      node.queueReadInterval = setInterval(eventCallback, node.queueReadIntervalTime)
    }

    node.removeModbusQueueActionsFromNode = function (eventCallback) {
      modbusClient.removeListener('mbqueue', eventCallback)
      modbusClient.removeListener('mbactive', eventCallback)
      modbusClient.removeListener('mbinit', eventCallback)
      modbusClient.removeListener('mbconnected', eventCallback)
      modbusClient.removeListener('mberror', eventCallback)
      modbusClient.removeListener('mbclosed', eventCallback)
    }

    if (node.updateOnAllUnitQueues) {
      node.registerModbusQueueActionsToNode(node.readFromAllUnitQueues)
      mbBasics.setNodeStatusTo('active for all queues', node)
    } else {
      node.registerModbusQueueActionsToNode(node.readFromQueue)
    }

    node.on('input', function (msg) {
      let msgUnitId = node.unitid
      msg.payload.queueEnabled = modbusClient.bufferCommands

      if (node.updateOnAllUnitQueues) {
        msg.payload.allQueueData = true
        msg.payload.queues = modbusClient.bufferCommandList
      } else {
        try {
          if (msg.payload.resetQueue) {
            msgUnitId = parseInt(msg.payload.unitId) || node.unitid
          } else {
            msgUnitId = parseInt(msg.payload) || node.unitid
          }
        } catch (err) {
          node.errorProtocolMsg(err, msg)
          mbBasics.sendEmptyMsgOnFail(node, err, msg)
          msgUnitId = node.unitid
        }
        msg.payload.allQueueData = false
        msg.payload.unitid = msgUnitId
        msg.payload.queue = modbusClient.bufferCommandList.get(msgUnitId)
      }

      msg.payload.queueOptions = {
        date: Date.now(),
        state: 'queue request',
        modbusClientName: modbusClient.name || modbusClient.id,
        lowlowLevel: node.lowlowLevel,
        unitId: msgUnitId,
        lowLevel: node.lowLevel,
        highLevel: node.highLevel,
        highHighLevel: node.highHighLevel
      }

      const msgQueueReset = msg.payload.resetQueue || msg.resetQueue
      if (msgQueueReset && modbusClient.bufferCommands) {
        coreModbusQueue.initQueue(modbusClient)
        if (RED.settings.verbose) {
          const infoText = 'Init Queue By External Node'
          modbusClient.warn(infoText)
          internalDebugLog(infoText)
        }
        node.initUnitQueueStates()

        if (node.showStatusActivities) {
          node.status({
            fill: 'blue',
            shape: 'ring',
            text: 'active empty unit queue'
          })
        }
        msg.payload.queueOptions.state = 'queue reset done'
      }

      node.send(msg)
    })

    node.on('close', function (done) {
      if (node.updateOnAllUnitQueues) {
        node.removeModbusQueueActionsFromNode(node.readFromAllUnitQueues)
      } else {
        node.removeModbusQueueActionsFromNode(node.readFromQueue)
      }
      mbBasics.setNodeStatusTo('closed', node)
      if (node.queueReadInterval) {
        clearInterval(node.queueReadInterval)
      }
      node.queueReadInterval = null
      modbusClient.deregisterForModbus(node.id, done)
    })

    if (!node.showStatusActivities) {
      mbBasics.setNodeDefaultStatus(node)
    }
  }

  RED.nodes.registerType('modbus-queue-info', ModbusQueueInfo)
}
