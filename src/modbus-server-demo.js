/**
 Copyright (c) since the year 2016 Klaus Landsdorf (http://plus4nodered.com/)
 All rights reserved.
 node-red-contrib-modbus - The BSD 3-Clause License

 @author <a href="mailto:klaus.landsdorf@bianco-royal.de">Klaus Landsdorf</a> (Bianco Royal)
 **/

/**
 * Modbus Demo Server node with automatic data generation.
 * @module NodeRedModbusDemoServer
 *
 * @param RED
 */
module.exports = function (RED) {
  'use strict'
  // SOURCE-MAP-REQUIRED
  const modbus = require('jsmodbus')
  const net = require('net')
  // const coreServer = require('./core/modbus-server-core')
  const mbBasics = require('./modbus-basics')
  const internalDebugLog = require('./core/modbus-logger').getDebugLogger('contribModbus:server:demo')

  function ModbusDemoServer (config) {
    RED.nodes.createNode(this, config)

    const bufferFactor = 8

    this.name = config.name
    this.logEnabled = config.logEnabled
    this.hostname = config.hostname || '0.0.0.0'
    this.serverPort = parseInt(config.serverPort) || 10502
    this.responseDelay = parseInt(config.responseDelay) || 1
    this.delayUnit = config.delayUnit
    this.showStatusActivities = config.showStatusActivities || false

    // Buffer sizes
    this.coilsBufferSize = parseInt(config.coilsBufferSize * bufferFactor) || 80000
    this.holdingBufferSize = parseInt(config.holdingBufferSize * bufferFactor) || 80000
    this.inputBufferSize = parseInt(config.inputBufferSize * bufferFactor) || 80000
    this.discreteBufferSize = parseInt(config.discreteBufferSize * bufferFactor) || 80000

    // Demo settings
    this.demoDataPattern = config.demoDataPattern || 'sequential' // sequential, random, sine, square, sawtooth, mixed
    this.demoUpdateInterval = parseInt(config.demoUpdateInterval) || 1000 // ms
    this.demoAutoStart = config.demoAutoStart !== false
    this.demoRandomSeed = config.demoRandomSeed || null
    this.demoValueRange = {
      min: parseInt(config.demoValueMin) || 0,
      max: parseInt(config.demoValueMax) || 65535
    }

    // Advanced demo features
    this.demoRealisticMode = config.demoRealisticMode || false
    this.demoDeviceSimulation = config.demoDeviceSimulation || 'generic'
    this.demoErrorRate = parseFloat(config.demoErrorRate) || 0 // 0-1 probability

    this.showErrors = config.showErrors
    this.internalDebugLog = internalDebugLog
    this.verboseLogging = RED.settings.verbose

    const node = this

    node.netServer = null
    node.modbusServer = null
    node.demoTimer = null
    node.demoCounter = 0
    node.deviceStates = {}

    mbBasics.setNodeStatusTo('initialized', node)

    // Initialize demo data buffers
    node.demoData = {
      coils: Buffer.alloc(node.coilsBufferSize),
      discrete: Buffer.alloc(node.discreteBufferSize),
      holding: Buffer.alloc(node.holdingBufferSize),
      input: Buffer.alloc(node.inputBufferSize)
    }

    // Demo data generation functions
    const generateDemoData = {
      sequential: function (counter, max, min) {
        const range = max - min
        return min + (counter % range)
      },
      random: function (counter, max, min) {
        if (node.demoRandomSeed !== null) {
          // Pseudo-random for reproducible testing
          const seed = node.demoRandomSeed + counter
          const x = Math.sin(seed) * 10000
          return min + Math.floor((x - Math.floor(x)) * (max - min))
        }
        return min + Math.floor(Math.random() * (max - min))
      },
      sine: function (counter, max, min) {
        const range = max - min
        return min + Math.floor((Math.sin(counter * 0.1) + 1) * range / 2)
      },
      square: function (counter, max, min) {
        return (Math.floor(counter / 10) % 2) ? max : min
      },
      sawtooth: function (counter, max, min) {
        const period = 20
        const range = max - min
        return min + Math.floor((counter % period) * range / period)
      },
      mixed: function (counter, max, min, index) {
        // Different patterns for different registers
        const patterns = ['sequential', 'random', 'sine', 'square', 'sawtooth']
        const patternIndex = index % patterns.length
        return generateDemoData[patterns[patternIndex]](counter, max, min)
      }
    }

    // Realistic device simulations
    const deviceSimulations = {
      generic: function () {
        return generateDemoData[node.demoDataPattern](
          node.demoCounter,
          node.demoValueRange.max,
          node.demoValueRange.min
        )
      },
      temperature: function (index) {
        // Simulate temperature sensor (20-30°C with slow changes)
        const base = 25
        const variation = 5 * Math.sin((node.demoCounter + index * 10) * 0.01)
        const noise = (Math.random() - 0.5) * 0.5
        return Math.floor((base + variation + noise) * 10) // Return in 0.1°C units
      },
      pressure: function (index) {
        // Simulate pressure sensor (950-1050 hPa)
        const base = 1000
        const variation = 50 * Math.sin((node.demoCounter + index * 15) * 0.005)
        const noise = (Math.random() - 0.5) * 2
        return Math.floor(base + variation + noise)
      },
      flowmeter: function (index) {
        // Simulate flow meter (0-1000 L/h with variations)
        const base = 500
        const variation = 300 * Math.sin((node.demoCounter + index * 20) * 0.02)
        const noise = (Math.random() - 0.5) * 50
        return Math.floor(Math.max(0, base + variation + noise))
      },
      motor: function (index) {
        // Simulate motor parameters (RPM, current, temperature)
        const rpm = 1500 + 500 * Math.sin(node.demoCounter * 0.01)
        const current = 10 + 5 * Math.sin(node.demoCounter * 0.02)
        const temp = 40 + 20 * Math.sin(node.demoCounter * 0.005)

        // Return different values based on register index
        switch (index % 3) {
          case 0: return Math.floor(rpm)
          case 1: return Math.floor(current * 10)
          case 2: return Math.floor(temp * 10)
        }
      },
      plc: function (index) {
        // Simulate PLC with various I/O states
        if (index < 100) {
          // Digital inputs/outputs
          return (node.demoCounter + index) % 2
        } else {
          // Analog values
          return generateDemoData.sine(node.demoCounter + index, 4095, 0)
        }
      }
    }

    // Update demo data periodically
    function updateDemoData () {
      const generator = node.demoRealisticMode
        ? deviceSimulations[node.demoDeviceSimulation] || deviceSimulations.generic
        : generateDemoData[node.demoDataPattern] || generateDemoData.sequential

      node.demoCounter++

      // Simulate occasional errors
      if (node.demoErrorRate > 0 && Math.random() < node.demoErrorRate) {
        if (node.verboseLogging) {
          internalDebugLog('Simulating error condition')
        }
        // Don't update data this cycle to simulate communication error
        return
      }

      // Update coils (boolean values)
      for (let i = 0; i < node.coilsBufferSize; i++) {
        if (node.demoRealisticMode && node.demoDeviceSimulation === 'plc') {
          node.demoData.coils[i] = generator(i) > 0 ? 1 : 0
        } else if (node.demoDataPattern === 'mixed') {
          node.demoData.coils[i] = generateDemoData.mixed(node.demoCounter + i, 2, 0, i)
        } else {
          node.demoData.coils[i] = generator(node.demoCounter + i, 2, 0)
        }
      }

      // Update discrete inputs (boolean values)
      for (let i = 0; i < node.discreteBufferSize; i++) {
        if (node.demoRealisticMode && node.demoDeviceSimulation === 'plc') {
          node.demoData.discrete[i] = generator(i + 1000) > 0 ? 1 : 0
        } else if (node.demoDataPattern === 'mixed') {
          node.demoData.discrete[i] = generateDemoData.mixed(node.demoCounter + i * 2, 2, 0, i)
        } else {
          node.demoData.discrete[i] = generator(node.demoCounter + i * 2, 2, 0)
        }
      }

      // Update holding registers (16-bit values)
      for (let i = 0; i < node.holdingBufferSize / 2; i++) {
        let value
        if (node.demoRealisticMode) {
          value = generator(i)
        } else if (node.demoDataPattern === 'mixed') {
          value = generateDemoData.mixed(
            node.demoCounter + i * 3,
            node.demoValueRange.max,
            node.demoValueRange.min,
            i
          )
        } else {
          value = generator(
            node.demoCounter + i * 3,
            node.demoValueRange.max,
            node.demoValueRange.min
          )
        }
        node.demoData.holding.writeUInt16BE(value, i * 2)
      }

      // Update input registers (16-bit values)
      for (let i = 0; i < node.inputBufferSize / 2; i++) {
        let value
        if (node.demoRealisticMode) {
          value = generator(i + 2000)
        } else if (node.demoDataPattern === 'mixed') {
          value = generateDemoData.mixed(
            node.demoCounter + i * 4,
            node.demoValueRange.max,
            node.demoValueRange.min,
            i
          )
        } else {
          value = generator(
            node.demoCounter + i * 4,
            node.demoValueRange.max,
            node.demoValueRange.min
          )
        }
        node.demoData.input.writeUInt16BE(value, i * 2)
      }

      if (node.verboseLogging) {
        internalDebugLog(`Demo data updated - Pattern: ${node.demoDataPattern}, Counter: ${node.demoCounter}`)
      }

      // Emit data update event
      node.emit('demoDataUpdated', {
        counter: node.demoCounter,
        pattern: node.demoDataPattern,
        timestamp: Date.now()
      })
    }

    function startServer () {
      try {
        // Create TCP server
        node.netServer = net.createServer()

        // Create Modbus server
        node.modbusServer = new modbus.server.TCP(node.netServer, {
          holding: node.demoData.holding,
          coils: node.demoData.coils,
          discrete: node.demoData.discrete,
          input: node.demoData.input
        })

        // Handle Modbus requests with optional delay
        if (node.responseDelay > 0) {
          const originalHandle = node.modbusServer.handle
          node.modbusServer.handle = function (request, cb) {
            const delay = node.delayUnit === 's'
              ? node.responseDelay * 1000
              : node.responseDelay

            setTimeout(() => {
              originalHandle.call(this, request, cb)
            }, delay)
          }
        }

        node.netServer.on('connection', function (socket) {
          internalDebugLog('Client connected from ' + socket.remoteAddress)
          mbBasics.setNodeStatusTo('connected', node)

          socket.on('error', function (err) {
            if (node.showErrors) {
              node.error('Socket error: ' + err.message, { error: err })
            }
            internalDebugLog('Socket error:', err)
          })

          socket.on('close', function () {
            internalDebugLog('Client disconnected')
            mbBasics.setNodeStatusTo('listening', node)
          })
        })

        node.netServer.on('error', function (err) {
          if (node.showErrors) {
            node.error('Server error: ' + err.message, { error: err })
          }
          internalDebugLog('Server error:', err)
          mbBasics.setNodeStatusTo('error', node)
        })

        node.netServer.on('listening', function () {
          const address = node.netServer.address()
          internalDebugLog('Demo Modbus Server listening on ' + address.address + ':' + address.port)
          mbBasics.setNodeStatusTo('listening', node)

          // Start demo data generation
          if (node.demoAutoStart) {
            startDemoDataGeneration()
          }

          node.status({
            fill: 'green',
            shape: 'dot',
            text: `Demo Server listening on port ${node.serverPort}`
          })
        })

        node.netServer.listen(node.serverPort, node.hostname)

        internalDebugLog('Starting Demo Modbus server on ' + node.hostname + ':' + node.serverPort)
      } catch (err) {
        node.error('Failed to start demo server: ' + err.message, { error: err })
        mbBasics.setNodeStatusTo('error', node)
      }
    }

    function startDemoDataGeneration () {
      updateDemoData() // Initial data

      if (node.demoTimer) {
        clearInterval(node.demoTimer)
      }

      node.demoTimer = setInterval(updateDemoData, node.demoUpdateInterval)

      if (node.verboseLogging) {
        internalDebugLog('Demo data generation started with interval: ' + node.demoUpdateInterval + 'ms')
      }
    }

    function stopDemoDataGeneration () {
      if (node.demoTimer) {
        clearInterval(node.demoTimer)
        node.demoTimer = null

        if (node.verboseLogging) {
          internalDebugLog('Demo data generation stopped')
        }
      }
    }

    node.on('input', function (msg) {
      if (typeof msg.payload === 'string') {
        switch (msg.payload.toLowerCase()) {
          case 'restart':
            node.warn('Restarting Demo Modbus Server')
            stopServer(function () {
              startServer()
            })
            break
          case 'stop':
            stopServer()
            break
          case 'start':
            startServer()
            break
          case 'startdemo':
            startDemoDataGeneration()
            break
          case 'stopdemo':
            stopDemoDataGeneration()
            break
          case 'reset':
            node.demoCounter = 0
            updateDemoData()
            node.status({
              fill: 'yellow',
              shape: 'dot',
              text: 'Demo data reset'
            })
            break
        }
      } else if (msg.payload && typeof msg.payload === 'object') {
        // Update configuration dynamically
        let configChanged = false

        if (msg.payload.pattern) {
          node.demoDataPattern = msg.payload.pattern
          configChanged = true
        }
        if (msg.payload.interval) {
          node.demoUpdateInterval = parseInt(msg.payload.interval)
          if (node.demoTimer) {
            stopDemoDataGeneration()
            startDemoDataGeneration()
          }
          configChanged = true
        }
        if (msg.payload.min !== undefined) {
          node.demoValueRange.min = parseInt(msg.payload.min)
          configChanged = true
        }
        if (msg.payload.max !== undefined) {
          node.demoValueRange.max = parseInt(msg.payload.max)
          configChanged = true
        }
        if (msg.payload.device) {
          node.demoDeviceSimulation = msg.payload.device
          node.demoRealisticMode = true
          configChanged = true
        }
        if (msg.payload.errorRate !== undefined) {
          node.demoErrorRate = parseFloat(msg.payload.errorRate)
          configChanged = true
        }

        if (configChanged) {
          updateDemoData()
          node.status({
            fill: 'yellow',
            shape: 'ring',
            text: 'Configuration updated'
          })
        }
      }

      // Output current demo data state
      node.send({
        payload: {
          counter: node.demoCounter,
          pattern: node.demoDataPattern,
          device: node.demoDeviceSimulation,
          realistic: node.demoRealisticMode,
          range: node.demoValueRange,
          errorRate: node.demoErrorRate,
          samples: {
            coil_0: node.demoData.coils[0],
            discrete_0: node.demoData.discrete[0],
            holding_0: node.demoData.holding.readUInt16BE(0),
            input_0: node.demoData.input.readUInt16BE(0)
          }
        }
      })
    })

    function stopServer (callback) {
      stopDemoDataGeneration()

      if (node.netServer) {
        node.netServer.close(function () {
          internalDebugLog('Demo Server stopped')
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

    // Start server on deploy if auto-start is enabled
    if (node.demoAutoStart) {
      startServer()
    }
  }

  RED.nodes.registerType('modbus-server-demo', ModbusDemoServer)
}
