/**
 * E2E: multidrop Timed out semantics on one shared Modbus-Client (#586 / #580).
 *
 * A minimal Modbus TCP peer answers only the present Unit IDs and stays silent
 * for absent ones, which makes the real modbus-serial client raise its
 * TransactionTimedOutError. With "Reconnect on timeout" off, an absent Unit ID
 * must fail only its own command — the shared connection must not be rebuilt.
 */

'use strict'

const assert = require('assert')
const net = require('net')
const clientNode = require('../../src/modbus-client.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const {
  getPort,
  waitForModbusClientActive,
  hardStopModbusClient
} = require('../helper/test-helper-extensions')

const CI = !!process.env.CI
const CLIENT_TIMEOUT_MS = 250
const RECONNECT_TIMEOUT_MS = 300
const OBSERVE_MS = CI ? 1800 : 1200
const WAIT_MS = CI ? 20000 : 10000

const PRESENT_UNIT = 103
const ABSENT_UNIT = 101

function clientFlow (port, reconnectOnTimeout) {
  return [
    { id: 'tab-to', type: 'tab', label: 'timeout-semantics', disabled: false },
    {
      id: 'clientTo',
      type: 'modbus-client',
      name: 'TimeoutSemanticsClient',
      clienttype: 'tcp',
      bufferCommands: true,
      stateLogEnabled: false,
      queueLogEnabled: false,
      failureLogEnabled: false,
      tcpHost: '127.0.0.1',
      tcpPort: port,
      tcpType: 'DEFAULT',
      serialPort: '/dev/ttyUSB',
      serialType: 'RTU-BUFFERED',
      serialBaudrate: '9600',
      serialDatabits: '8',
      serialStopbits: '1',
      serialParity: 'none',
      serialConnectionDelay: 100,
      serialAsciiResponseStartDelimiter: '0x3A',
      unit_id: PRESENT_UNIT,
      commandDelay: 1,
      clientTimeout: CLIENT_TIMEOUT_MS,
      reconnectOnTimeout,
      reconnectTimeout: RECONNECT_TIMEOUT_MS,
      parallelUnitIdsAllowed: false,
      maxQueueDepth: 200,
      showErrors: false,
      showWarnings: false
    }
  ]
}

/**
 * Minimal Modbus TCP peer: FC3 answers for present Unit IDs, silence otherwise.
 */
function startPeer (port, presentUnits, callback) {
  const sockets = new Set()
  const server = net.createServer(function (socket) {
    sockets.add(socket)
    socket.on('close', function () { sockets.delete(socket) })
    socket.on('error', function () { /* swallow */ })
    let buffer = Buffer.alloc(0)
    socket.on('data', function (chunk) {
      buffer = Buffer.concat([buffer, chunk])
      while (buffer.length >= 8) {
        const frameLength = 6 + buffer.readUInt16BE(4)
        if (buffer.length < frameLength) break
        const frame = buffer.slice(0, frameLength)
        buffer = buffer.slice(frameLength)
        const unit = frame[6]
        if (!presentUnits.has(unit) || frame[7] !== 3) continue
        const quantity = frame.readUInt16BE(10)
        const response = Buffer.alloc(9 + 2 * quantity)
        frame.copy(response, 0, 0, 2) // transaction id
        response.writeUInt16BE(3 + 2 * quantity, 4)
        response[6] = unit
        response[7] = 3
        response[8] = 2 * quantity
        socket.write(response)
      }
    })
  })
  server.listen(port, '127.0.0.1', function () {
    callback(null, {
      server,
      sockets,
      stop: function (done) {
        sockets.forEach(function (socket) { socket.destroy() })
        server.close(function () { done() })
      }
    })
  })
}

function readUnit (client, unit, callback) {
  client.emit('readModbus', {
    payload: { fc: 3, unitid: unit, address: 0, quantity: 1 },
    queueUnitId: unit
  }, function (resp) {
    callback(null, resp)
  }, function (err) {
    callback(err)
  })
}

describe('E2E Modbus-Client Timed out semantics on a shared connection (#586/#580)', function () {
  this.timeout(CI ? 90000 : 45000)

  let peer

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    const client = helper.getNode('clientTo')
    if (client) hardStopModbusClient(client)
    const finish = function () {
      helper.unload().then(function () { done() }).catch(done)
    }
    if (peer) {
      const current = peer
      peer = null
      current.stop(finish)
    } else {
      finish()
    }
  })

  after(function (done) {
    const timer = setTimeout(done, 5000)
    helper.stopServer(function () {
      clearTimeout(timer)
      done()
    })
  })

  function loadActiveClient (reconnectOnTimeout, callback) {
    getPort().then(function (port) {
      startPeer(port, new Set([PRESENT_UNIT]), function (peerErr, startedPeer) {
        if (peerErr) return callback(peerErr)
        peer = startedPeer
        helper.load([clientNode], clientFlow(port, reconnectOnTimeout), function (loadErr) {
          if (loadErr) return callback(loadErr)
          const client = helper.getNode('clientTo')
          // the FSM starts with the first registered consumer node
          client.registerForModbus('timeout-semantics-consumer')
          waitForModbusClientActive(client, function (activeErr) {
            callback(activeErr, client)
          }, WAIT_MS)
        })
      })
    })
  }

  it('reconnectOnTimeout=false: absent Unit ID fails alone, shared connection stays, healthy Unit keeps answering', function (done) {
    loadActiveClient(false, function (err, client) {
      if (err) return done(err)

      const transportBefore = client.client
      const cycleEvents = []
      ;['mbinit', 'mbbroken', 'mbreconnecting', 'mbclosed'].forEach(function (eventName) {
        client.on(eventName, function () { cycleEvents.push(eventName) })
      })

      readUnit(client, PRESENT_UNIT, function (firstErr) {
        if (firstErr) return done(new Error('healthy unit failed before timeout: ' + firstErr.message))

        readUnit(client, ABSENT_UNIT, function (timeoutErr) {
          try {
            assert.ok(timeoutErr, 'absent Unit ID must time out')
            assert.strictEqual(timeoutErr.message, 'Timed out')
          } catch (e) {
            return done(e)
          }

          // outlast reconnectTimeout: a (wrongly) triggered rebuild would show up by now
          setTimeout(function () {
            try {
              assert.deepStrictEqual(cycleEvents, [], 'no FSM recovery cycle expected, saw: ' + cycleEvents.join(','))
              assert.strictEqual(client.client, transportBefore, 'shared Modbus client instance must not be replaced')
            } catch (e) {
              return done(e)
            }

            readUnit(client, PRESENT_UNIT, function (secondErr) {
              if (secondErr) return done(new Error('healthy unit failed after absent-unit timeout: ' + secondErr.message))
              done()
            })
          }, OBSERVE_MS)
        })
      })
    })
  })

  it('reconnectOnTimeout=false: genuine transport loss still recovers', function (done) {
    loadActiveClient(false, function (err, client) {
      if (err) return done(err)

      const port = parseInt(client.tcpPort, 10)
      const transportBefore = client.client

      client.once('mbbroken', function () {
        startPeer(port, new Set([PRESENT_UNIT]), function (peerErr, restartedPeer) {
          if (peerErr) return done(peerErr)
          peer = restartedPeer
          waitForModbusClientActive(client, function (activeErr) {
            if (activeErr) return done(activeErr)
            try {
              assert.notStrictEqual(client.client, transportBefore, 'transport must have been rebuilt')
            } catch (e) {
              return done(e)
            }
            readUnit(client, PRESENT_UNIT, function (readErr) {
              done(readErr || undefined)
            })
          }, WAIT_MS)
        })
      })

      peer.stop(function () {
        peer = null
        // the next command notices the dead socket (no idle close detection yet)
        readUnit(client, PRESENT_UNIT, function () { /* failure expected */ })
      })
    })
  })
})
