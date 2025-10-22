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
    node.configData = []

    // Only proceed if a valid, existing regular file is provided
    if (!node.path) {
      coreIO.internalDebug('IO File path is empty')
      node.warn('Modbus IO File path is empty; using empty config')
    } else if (!fs.existsSync(node.path)) {
      coreIO.internalDebug('IO File Not Found ' + node.path)
      node.warn('Modbus IO File Not Found ' + node.path)
    } else {
      let isFile = false
      try {
        const st = fs.lstatSync(node.path)
        isFile = st && typeof st.isFile === 'function' && st.isFile()
      } catch (err) {
        coreIO.internalDebug(err.message)
      }

      if (!isFile) {
        coreIO.internalDebug('IO path is not a file: ' + node.path)
        node.warn('Modbus IO path is not a file; using empty config: ' + node.path)
      } else {
        try {
          node.lineReader = new coreIO.LineByLineReader(node.path)
          coreIO.internalDebug('Read IO File ' + node.path)

          function setLineReaderEvents () {
            if (node.lineReader && typeof node.lineReader.removeAllListeners === 'function') {
              node.lineReader.removeAllListeners()
            }

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

          // Watch for changes; fs.watchFile returns void, so just ensure unwatch on close
          fs.watchFile(node.path, (curr, prev) => {
            coreIO.internalDebug(`the current mtime is: ${curr.mtime}`)
            coreIO.internalDebug(`the previous mtime was: ${prev.mtime}`)

            if (curr.mtime !== prev.mtime) {
              coreIO.internalDebug('Reload IO File ' + node.path)
              node.configData = []
              delete node.lastUpdatedAt
              if (node.lineReader && typeof node.lineReader.removeAllListeners === 'function') {
                node.lineReader.removeAllListeners()
              }
              try {
                node.lineReader = new coreIO.LineByLineReader(node.path)
                setLineReaderEvents()
                coreIO.internalDebug('Reloading IO File Started For ' + node.path)
              } catch (err) {
                coreIO.internalDebug(err.message)
              }
            }
          })
        } catch (err) {
          coreIO.internalDebug(err.message)
          node.warn('Failed to read IO file: ' + err.message)
        }
      }
    }

    node.on('close', function (done) {
      try {
        if (node.path) {
          try { fs.unwatchFile(node.path) } catch (e) { /* ignore */ }
        }
        if (node.lineReader && typeof node.lineReader.removeAllListeners === 'function') {
          try { node.lineReader.removeAllListeners() } catch (e) { /* ignore */ }
        }
      } finally {
        node.removeAllListeners()
        done()
      }
    })
  }

  RED.nodes.registerType('modbus-io-config', ModbusIOConfigNode)
}
