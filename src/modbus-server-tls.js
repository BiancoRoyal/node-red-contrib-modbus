/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

/**
 * Modbus TLS Server Demo node.
 * @module NodeRedModbusTLSServer
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const modbus = require('jsmodbus')
  const tls = require('tls')
  const fs = require('fs')
  // const path = require('path')
  // const coreServer = require('./core/modbus-server-core')
  const mbBasics = require('./modbus-basics')
  const internalDebugLog = require('./core/modbus-logger').getDebugLogger('contribModbus:server:tls')

  function ModbusTLSServer (config) {
    RED.nodes.createNode(this, config)

    const bufferFactor = 8

    this.name = config.name
    this.logEnabled = config.logEnabled
    this.hostname = config.hostname || '0.0.0.0'
    this.serverPort = parseInt(config.serverPort) || 8502
    this.responseDelay = parseInt(config.responseDelay) || 1
    this.delayUnit = config.delayUnit
    this.showStatusActivities = config.showStatusActivities || false

    // Buffer sizes
    this.coilsBufferSize = parseInt(config.coilsBufferSize * bufferFactor) || 80000
    this.holdingBufferSize = parseInt(config.holdingBufferSize * bufferFactor) || 80000
    this.inputBufferSize = parseInt(config.inputBufferSize * bufferFactor) || 80000
    this.discreteBufferSize = parseInt(config.discreteBufferSize * bufferFactor) || 80000

    // TLS Configuration
    this.tlsOptions = {
      key: config.privateKey || '',
      cert: config.certificate || '',
      ca: config.ca || '',
      rejectUnauthorized: config.rejectUnauthorized !== false,
      requestCert: config.requestCert === true,
      secureProtocol: config.secureProtocol || 'TLSv1_2_method'
    }

    // Demo mode settings
    this.demoMode = config.demoMode !== false
    this.demoDataPattern = config.demoDataPattern || 'sequential' // sequential, random, sine, square
    this.demoUpdateInterval = parseInt(config.demoUpdateInterval) || 1000 // ms

    this.showErrors = config.showErrors
    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this

    node.tlsServer = null
    node.modbusServer = null
    node.demoTimer = null
    node.demoCounter = 0

    mbBasics.setNodeStatusTo('initialized', node)

    // Initialize demo data
    node.demoData = {
      coils: Buffer.alloc(node.coilsBufferSize),
      discrete: Buffer.alloc(node.discreteBufferSize),
      holding: Buffer.alloc(node.holdingBufferSize),
      input: Buffer.alloc(node.inputBufferSize)
    }

    // Demo data generation functions
    const generateDemoData = {
      sequential: function (counter, max) {
        return counter % max
      },
      random: function (counter, max) {
        return Math.floor(Math.random() * max)
      },
      sine: function (counter, max) {
        return Math.floor((Math.sin(counter * 0.1) + 1) * max / 2)
      },
      square: function (counter, max) {
        return (Math.floor(counter / 10) % 2) * max
      }
    }

    // Update demo data periodically
    function updateDemoData () {
      if (!node.demoMode) return

      const generator = generateDemoData[node.demoDataPattern] || generateDemoData.sequential
      node.demoCounter++

      // Update coils (boolean values)
      for (let i = 0; i < node.coilsBufferSize; i++) {
        node.demoData.coils[i] = generator(node.demoCounter + i, 2)
      }

      // Update discrete inputs (boolean values)
      for (let i = 0; i < node.discreteBufferSize; i++) {
        node.demoData.discrete[i] = generator(node.demoCounter + i * 2, 2)
      }

      // Update holding registers (16-bit values)
      for (let i = 0; i < node.holdingBufferSize / 2; i++) {
        const value = generator(node.demoCounter + i * 3, 65536)
        node.demoData.holding.writeUInt16BE(value, i * 2)
      }

      // Update input registers (16-bit values)
      for (let i = 0; i < node.inputBufferSize / 2; i++) {
        const value = generator(node.demoCounter + i * 4, 65536)
        node.demoData.input.writeUInt16BE(value, i * 2)
      }

      if (node.verboseLogging) {
        internalDebugLog('Demo data updated with pattern:', node.demoDataPattern)
      }
    }

    function loadTLSOptions () {
      const options = {}

      // Load private key
      if (node.tlsOptions.key) {
        try {
          if (node.tlsOptions.key.startsWith('-----BEGIN')) {
            options.key = node.tlsOptions.key
          } else if (fs.existsSync(node.tlsOptions.key)) {
            options.key = fs.readFileSync(node.tlsOptions.key)
          }
        } catch (err) {
          node.error('Failed to load TLS private key: ' + err.message)
        }
      }

      // Load certificate
      if (node.tlsOptions.cert) {
        try {
          if (node.tlsOptions.cert.startsWith('-----BEGIN')) {
            options.cert = node.tlsOptions.cert
          } else if (fs.existsSync(node.tlsOptions.cert)) {
            options.cert = fs.readFileSync(node.tlsOptions.cert)
          }
        } catch (err) {
          node.error('Failed to load TLS certificate: ' + err.message)
        }
      }

      // Load CA certificate
      if (node.tlsOptions.ca) {
        try {
          if (node.tlsOptions.ca.startsWith('-----BEGIN')) {
            options.ca = node.tlsOptions.ca
          } else if (fs.existsSync(node.tlsOptions.ca)) {
            options.ca = fs.readFileSync(node.tlsOptions.ca)
          }
        } catch (err) {
          node.error('Failed to load CA certificate: ' + err.message)
        }
      }

      options.rejectUnauthorized = node.tlsOptions.rejectUnauthorized
      options.requestCert = node.tlsOptions.requestCert
      options.secureProtocol = node.tlsOptions.secureProtocol

      return options
    }

    function startServer () {
      try {
        const tlsOptions = loadTLSOptions()

        // For demo mode, generate self-signed certificate if not provided
        if (node.demoMode && (!tlsOptions.key || !tlsOptions.cert)) {
          const forge = require('node-forge')
          const pki = forge.pki

          // Generate key pair
          const keys = pki.rsa.generateKeyPair(2048)
          const cert = pki.createCertificate()

          cert.publicKey = keys.publicKey
          cert.serialNumber = '01'
          cert.validity.notBefore = new Date()
          cert.validity.notAfter = new Date()
          cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)

          const attrs = [{
            name: 'commonName',
            value: 'localhost'
          }, {
            name: 'countryName',
            value: 'US'
          }, {
            shortName: 'ST',
            value: 'Test'
          }, {
            name: 'localityName',
            value: 'Test'
          }, {
            name: 'organizationName',
            value: 'Node-RED Modbus Demo'
          }, {
            shortName: 'OU',
            value: 'Demo'
          }]

          cert.setSubject(attrs)
          cert.setIssuer(attrs)
          cert.setExtensions([{
            name: 'basicConstraints',
            cA: true
          }, {
            name: 'keyUsage',
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
          }, {
            name: 'subjectAltName',
            altNames: [{
              type: 2, // DNS
              value: 'localhost'
            }, {
              type: 7, // IP
              ip: '127.0.0.1'
            }]
          }])

          cert.sign(keys.privateKey)

          tlsOptions.key = pki.privateKeyToPem(keys.privateKey)
          tlsOptions.cert = pki.certificateToPem(cert)

          node.warn('Demo mode: Using self-signed certificate for TLS')
        }

        // Create TLS server
        node.tlsServer = tls.createServer(tlsOptions, function (socket) {
          internalDebugLog('TLS Client connected')

          // Create Modbus server for this socket
          const modbusServer = new modbus.server.TCP(socket, {
            holding: node.demoData.holding,
            coils: node.demoData.coils,
            discrete: node.demoData.discrete,
            input: node.demoData.input
          })

          modbusServer.on('connection', function (client) {
            internalDebugLog('Modbus client connected via TLS')
            mbBasics.setNodeStatusTo('connected', node)
          })

          socket.on('end', function () {
            internalDebugLog('TLS Client disconnected')
            mbBasics.setNodeStatusTo('listening', node)
          })

          socket.on('error', function (err) {
            if (node.showErrors) {
              node.error('TLS Socket error: ' + err.message, { error: err })
            }
            internalDebugLog('TLS Socket error:', err)
          })
        })

        node.tlsServer.on('error', function (err) {
          if (node.showErrors) {
            node.error('TLS Server error: ' + err.message, { error: err })
          }
          internalDebugLog('TLS Server error:', err)
          mbBasics.setNodeStatusTo('error', node)
        })

        node.tlsServer.on('listening', function () {
          const address = node.tlsServer.address()
          internalDebugLog('TLS Modbus Server listening on ' + address.address + ':' + address.port)
          mbBasics.setNodeStatusTo('listening', node)

          // Start demo data updates
          if (node.demoMode) {
            updateDemoData() // Initial data
            node.demoTimer = setInterval(updateDemoData, node.demoUpdateInterval)
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'TLS Demo Server listening on port ' + node.serverPort
            })
          }
        })

        node.tlsServer.listen(node.serverPort, node.hostname)

        internalDebugLog('Starting TLS Modbus server on ' + node.hostname + ':' + node.serverPort)
      } catch (err) {
        node.error('Failed to start TLS server: ' + err.message, { error: err })
        mbBasics.setNodeStatusTo('error', node)
      }
    }

    node.on('input', function (msg) {
      if (msg.payload === 'restart') {
        node.warn('Restarting TLS Modbus Server')
        stopServer(function () {
          startServer()
        })
      } else if (msg.payload === 'stop') {
        stopServer()
      } else if (msg.payload === 'start') {
        startServer()
      } else if (msg.payload && typeof msg.payload === 'object') {
        // Allow updating demo data via messages
        if (msg.payload.pattern) {
          node.demoDataPattern = msg.payload.pattern
        }
        if (msg.payload.interval) {
          node.demoUpdateInterval = parseInt(msg.payload.interval)
          if (node.demoTimer) {
            clearInterval(node.demoTimer)
            node.demoTimer = setInterval(updateDemoData, node.demoUpdateInterval)
          }
        }
      }
    })

    function stopServer (callback) {
      if (node.demoTimer) {
        clearInterval(node.demoTimer)
        node.demoTimer = null
      }

      if (node.tlsServer) {
        node.tlsServer.close(function () {
          internalDebugLog('TLS Server stopped')
          mbBasics.setNodeStatusTo('stopped', node)
          if (callback) callback()
        })
      } else {
        if (callback) callback()
      }
    }

    node.on('close', function (done) {
      stopServer(done)
    })

    // Start server on deploy
    startServer()
  }

  RED.nodes.registerType('modbus-server-tls', ModbusTLSServer)
}
