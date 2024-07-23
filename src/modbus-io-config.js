/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus
 node-red-contrib-modbusio

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 */

/**
 * Modbus IO Config node.
 * @module NodeRedModbusIOConfig
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const coreIO = require('./core/modbus-io-core')

  function ModbusIOConfigNode (config) {
    const fs = require('fs-extra')
    const UNLIMITED_LISTENERS = 0

    RED.nodes.createNode(this, config)

    this.name = config.name
    this.path = config.path
    this.format = config.format
    this.addressOffset = config.addressOffset

    const node = this
    node.setMaxListeners(UNLIMITED_LISTENERS)
    node.lastUpdatedAt = null

    if (!fs.existsSync(node.path)) {
      coreIO.internalDebug('IO File Not Found ' + node.path)
      node.warn('Modbus IO File Not Found ' + node.path)
    } else {
      node.lineReader = new coreIO.LineByLineReader(node.path)
      coreIO.internalDebug('Read IO File ' + node.path)
      node.configData = []

      function setLineReaderEvents () {
        node.lineReader.removeAllListeners()

        node.lineReader.on('error', function (err) {
          coreIO.internalDebug(err.message)
        })

        node.lineReader.on('line', function (line) {
          if (line) {
            node.configData.push(line)
          }
        })

        node.lineReader.on('end', function () {
          node.lastUpdatedAt = Date.now()
          coreIO.internalDebug('Read IO Done From File ' + node.path)
          node.warn({
            payload: coreIO.allValueNamesFromIOFile(node),
            name: 'Modbus Value Names From IO File',
            path: node.path
          })
          node.emit('updatedConfig', node.configData)
        })

        coreIO.internalDebug('Loading IO File Started For ' + node.path)
      }

      setLineReaderEvents()

      node.watcher = fs.watchFile(node.path, (curr, prev) => {
        coreIO.internalDebug(`the current mtime is: ${curr.mtime}`)
        coreIO.internalDebug(`the previous mtime was: ${prev.mtime}`)

        if (curr.mtime !== prev.mtime) {
          coreIO.internalDebug('Reload IO File ' + node.path)
          node.configData = []
          delete node.lastUpdatedAt
          node.lineReader.removeAllListeners()
          node.lineReader = new coreIO.LineByLineReader(node.path)
          setLineReaderEvents()
          coreIO.internalDebug('Reloading IO File Started For ' + node.path)
        }
      })
    }

    node.on('close', function (done) {
      fs.unwatchFile(node.path)
      node.watcher.stop()
      node.lineReader.removeAllListeners()
      node.removeAllListeners()
      done()
    })
  }

  RED.nodes.registerType('modbus-io-config', ModbusIOConfigNode)
}
