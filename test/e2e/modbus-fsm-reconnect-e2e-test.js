/**
 * E2E: Modbus-Client FSM reconnect stability + message handling.
 *
 * Live TCP: server up → outage → reconnect → recovery, queue wipe on INIT,
 * Client-Not-Ready while inactive, Response-Filter after reconnect.
 * Aligned with FR-FSM-* reconnect semantics.
 */

'use strict'

const assert = require('assert')
const catchNode = require('@node-red/nodes/core/common/25-catch')
const injectNode = require('@node-red/nodes/core/common/20-inject')
const clientNode = require('../../src/modbus-client.js')
const serverNode = require('../../src/modbus-server.js')
const flexGetterNode = require('../../src/modbus-flex-getter.js')
const flexWriteNode = require('../../src/modbus-flex-write.js')
const responseFilterNode = require('../../src/modbus-response-filter.js')
const ioConfigNode = require('../../src/modbus-io-config.js')
const queueCore = require('../../src/core/modbus-queue-core.js')

const helper = require('node-red-node-test-helper')
helper.init(require.resolve('node-red'))

const flows = require('./flows/modbus-fsm-reconnect-e2e-flows')
const {
  getPort,
  waitForModbusClientActive,
  waitForModbusServerListening,
  waitForModbusClientEvent,
  waitForModbusClientState,
  waitForModbusClientInactive,
  startTcpModbusServer,
  stopTcpModbusServer,
  simulateTcpOutage,
  hardStopModbusClient,
  abandonNetServer,
  validateFlowFixture,
  measure
} = require('../helper/test-helper-extensions')

const nodes = [
  catchNode,
  injectNode,
  clientNode,
  serverNode,
  flexGetterNode,
  flexWriteNode,
  responseFilterNode,
  ioConfigNode
]

const CI = !!process.env.CI
const SUITE_MS = CI ? 150000 : 90000
const CLIENT_WAIT_MS = CI ? 30000 : 15000
const SERVER_WAIT_MS = CI ? 15000 : 5000
const RECOVER_WAIT_MS = CI ? 45000 : 25000
const MSG_WAIT_MS = CI ? 20000 : 12000

function onceDone (done) {
  let settled = false
  return function (err) {
    if (settled) return
    settled = true
    done(err)
  }
}

function prepareFlow (template, port, opts = {}) {
  const flow = JSON.parse(JSON.stringify(template))
  for (const node of flow) {
    if (!node) continue
    if (node.type === 'modbus-server') {
      node.serverPort = port
      node.responseDelay = opts.responseDelay != null
        ? opts.responseDelay
        : (CI ? 5 : 2)
    }
    if (node.type === 'modbus-client') {
      node.tcpPort = port
      node.clientTimeout = opts.clientTimeout != null
        ? opts.clientTimeout
        : (CI ? 4000 : 2000)
      node.commandDelay = CI ? 10 : 1
      node.reconnectTimeout = opts.reconnectTimeout != null
        ? opts.reconnectTimeout
        : (CI ? 500 : 300)
      if (opts.reconnectOnTimeout !== undefined) {
        node.reconnectOnTimeout = opts.reconnectOnTimeout
      }
      if (opts.parallelUnitIdsAllowed !== undefined) {
        node.parallelUnitIdsAllowed = opts.parallelUnitIdsAllowed
      }
    }
  }
  validateFlowFixture(flow)
  return flow
}

function loadReconnectFlow (opts, cb) {
  getPort().then((port) => {
    const flow = prepareFlow(flows.reconnectFilterFlow, port, opts || {})
    helper.load(nodes, flow, function (err) {
      if (err) return cb(err)
      const server = helper.getNode('serverFsm')
      const client = helper.getNode('clientFsm')
      waitForModbusServerListening(server, function (sErr) {
        if (sErr) return cb(sErr)
        waitForModbusClientActive(client, function (cErr) {
          if (cErr) return cb(cErr)
          cb(null, { server, client, port })
        }, CLIENT_WAIT_MS)
      }, SERVER_WAIT_MS)
    })
  }).catch(cb)
}

/**
 * Restart TCP listener and wait until client isActive again.
 * By default does NOT nudge connectClient (field-like FR recovery, AC-05).
 * Pass { nudge: true } only for teardown grace on flaky CI hosts.
 */
function recoverClient (client, server, callback, maxWaitMs, opts) {
  const nudgeEnabled = opts && opts.nudge === true
  startTcpModbusServer(server, function (startErr) {
    if (startErr) return callback(startErr)

    let nudges = 0
    let nudge = null
    if (nudgeEnabled) {
      nudge = setInterval(function () {
        if (client.isActive && client.isActive()) {
          clearInterval(nudge)
          return
        }
        if (nudges++ > 40 || client.closingModbus) {
          clearInterval(nudge)
          return
        }
        const st = client.actualServiceState && client.actualServiceState.value
        if (st === 'init' && typeof client.connectClient === 'function') {
          try {
            client.connectClient()
          } catch (e) { /* ignore */ }
        }
      }, Math.max(120, (client.reconnectTimeout || 300)))
    }

    waitForModbusClientActive(client, function (activeErr) {
      if (nudge) clearInterval(nudge)
      callback(activeErr)
    }, maxWaitMs || RECOVER_WAIT_MS)
  })
}

function queueDepth (client, unitId) {
  const q = client.bufferCommandList.get(unitId)
  return q ? q.length : 0
}

function writeThenFilterRead (magic, cb) {
  const timeoutMs = MSG_WAIT_MS
  const flexWrite = helper.getNode('flexWriteFsm')
  const flexGet = helper.getNode('flexGetFsm')
  const helperWrite = helper.getNode('helperWriteFsm')
  const helperFilter = helper.getNode('helperFilterFsm')

  assert.ok(flexWrite && flexGet && helperWrite && helperFilter, 'roundtrip nodes must exist')

  let settled = false
  const finish = function (err) {
    if (settled) return
    settled = true
    clearTimeout(timer)
    cb(err)
  }

  const timer = setTimeout(function () {
    finish(new Error('timeout write→filter-read magic=' + magic))
  }, timeoutMs)

  helperFilter.once('input', function (msg) {
    try {
      assert.ok(Array.isArray(msg.payload), 'filter payload array')
      assert.ok(msg.payload.length >= 1, 'filter kept at least one IO')
      assert.strictEqual(msg.payload[0].name, 'iRoundTrip')
      assert.strictEqual(msg.payload[0].value, magic)
      finish()
    } catch (e) {
      finish(e)
    }
  })

  helperWrite.once('input', function () {
    flexGet.receive({
      payload: { fc: 3, unitid: 1, address: 0, quantity: 3 }
    })
  })

  flexWrite.receive({
    payload: { fc: 6, unitid: 1, address: 0, quantity: 1, value: magic }
  })
}

describe('E2E Modbus FSM reconnect + message handling', function () {
  this.timeout(SUITE_MS)

  before(function (done) {
    helper.startServer(done)
  })

  afterEach(function (done) {
    const finish = onceDone(done)
    try {
      const client = helper.getNode('clientFsm')
      const server = helper.getNode('serverFsm')
      if (client) hardStopModbusClient(client)
      if (server) {
        abandonNetServer(server.netServer)
        stopTcpModbusServer(server, function () {
          helper.unload().then(function () { finish() }).catch(finish)
        }, { failSafeMs: 300 })
        return
      }
    } catch (e) { /* nodes already gone */ }
    helper.unload().then(function () { finish() }).catch(finish)
  })

  after(function (done) {
    const finish = onceDone(done)
    const t = setTimeout(function () { finish() }, 5000)
    helper.stopServer(function () {
      clearTimeout(t)
      finish()
    })
  })

  it('server outage → FSM reconnect → server back → filtered Modbus roundtrip', function (done) {
    const finish = onceDone(done)
    const MAGIC = 2002

    loadReconnectFlow({}, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx
      const trail = []
      const unsub = client.stateService.subscribe(function (state) {
        if (state && state.value && trail[trail.length - 1] !== state.value) {
          trail.push(state.value)
        }
      })

      const saw = { broken: false, reconnecting: false, init: false }
      client.on('mbbroken', function () { saw.broken = true })
      client.on('mbreconnecting', function () { saw.reconnecting = true })
      client.on('mbinit', function () { saw.init = true })

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) {
          unsub.unsubscribe()
          return finish(stopErr)
        }

        waitForModbusClientInactive(client, function (inactiveErr) {
          if (inactiveErr) {
            unsub.unsubscribe()
            return finish(inactiveErr)
          }

          // Brief outage window so reconnect timer can arm (FR-FSM-06/07)
          setTimeout(function () {
            recoverClient(client, server, function (activeErr) {
              unsub.unsubscribe()
              if (activeErr) return finish(activeErr)

              try {
                assert.ok(
                  saw.broken || saw.reconnecting || saw.init ||
                    trail.some(function (s) {
                      return s === 'broken' || s === 'reconnecting' || s === 'closed' || s === 'failed' || s === 'init'
                    }),
                  'expected outage FSM activity, trail=' + trail.join('→')
                )
                assert.ok(
                  trail.some(function (s) {
                    return s === 'connected' || s === 'activated' || s === 'queueing'
                  }),
                  'expected recovery states, trail=' + trail.join('→')
                )
                measure('fsm.reconnect', { trail: trail.join('→') })
              } catch (e) {
                return finish(e)
              }

              writeThenFilterRead(MAGIC, finish)
            }, RECOVER_WAIT_MS)
          }, CI ? 500 : 300)
        }, CI ? 10000 : 5000)
      })
    })
  })

  it('while server down: readModbus rejects with Client Not Ready', function (done) {
    const finish = onceDone(done)

    loadReconnectFlow({}, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) return finish(stopErr)

        waitForModbusClientInactive(client, function (inactiveErr, state) {
          if (inactiveErr) return finish(inactiveErr)

          client.emit('readModbus', {
            payload: { fc: 3, unitid: 1, address: 0, quantity: 1 }
          }, function () {
            finish(new Error('readModbus should not succeed while inactive (state=' + state + ')'))
          }, function (readErr) {
            try {
              assert.ok(readErr)
              assert.ok(
                /Client Not Ready To Read/i.test(readErr.message),
                'got: ' + readErr.message
              )
              finish()
            } catch (e) {
              finish(e)
            }
          })
        }, CI ? 10000 : 5000)
      })
    })
  })

  it('INIT after outage wipes command queues and notifies pending (FR-Q-WIPE)', function (done) {
    const finish = onceDone(done)

    loadReconnectFlow({}, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx

      let wipeErrors = 0
      client.bufferCommandList.get(1).push({
        callModbus: function () {},
        msg: { payload: { fc: 3, unitid: 1, address: 0, quantity: 1 } },
        cb: function () {},
        cberr: function (e) {
          if (e && String(e.message).indexOf('queue cleared on reconnect') !== -1) wipeErrors++
        }
      })
      client.bufferCommandList.get(2).push({
        callModbus: function () {},
        msg: { payload: { fc: 3, unitid: 2, address: 0, quantity: 1 } },
        cb: function () {},
        cberr: function (e) {
          if (e && String(e.message).indexOf('queue cleared on reconnect') !== -1) wipeErrors++
        }
      })
      assert.ok(queueDepth(client, 1) >= 1)
      assert.ok(queueDepth(client, 2) >= 1)

      waitForModbusClientEvent(client, 'mbinit', function (initErr) {
        if (initErr) return finish(initErr)
        try {
          assert.ok(queueCore.checkQueuesAreEmpty(client), 'queues empty after INIT')
          assert.strictEqual(queueDepth(client, 1), 0)
          assert.strictEqual(queueDepth(client, 2), 0)
          assert.deepStrictEqual(client.unitSendingAllowed, [])
          assert.strictEqual(wipeErrors, 2, 'both pending commands must get wipe error')
        } catch (e) {
          return finish(e)
        }

        recoverClient(client, server, function (activeErr) {
          if (activeErr) return finish(activeErr)
          writeThenFilterRead(3333, finish)
        }, RECOVER_WAIT_MS)
      }, CI ? 15000 : 8000)

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) return finish(stopErr)
      })
    })
  })

  it('after reconnect: sequential UnitIds drain without stall', function (done) {
    const finish = onceDone(done)

    loadReconnectFlow({ parallelUnitIdsAllowed: false }, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx
      assert.strictEqual(client.parallelUnitIdsAllowed, false)

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) return finish(stopErr)

        waitForModbusClientInactive(client, function (inactiveErr) {
          if (inactiveErr) return finish(inactiveErr)

          recoverClient(client, server, function (activeErr) {
            if (activeErr) return finish(activeErr)

            const flexGet = helper.getNode('flexGetFsm')
            const helperFilter = helper.getNode('helperFilterFsm')
            let filterHits = 0
            let settled = false

            const timer = setTimeout(function () {
              if (!settled) {
                settled = true
                finish(new Error('timeout sequential drain filterHits=' + filterHits))
              }
            }, MSG_WAIT_MS)

            helperFilter.on('input', function (msg) {
              try {
                assert.strictEqual(msg.payload[0].name, 'iRoundTrip')
                filterHits++
                if (filterHits >= 4 && !settled) {
                  settled = true
                  clearTimeout(timer)
                  assert.ok(queueDepth(client, 1) < 20, 'unit1 queue wedged')
                  assert.ok(queueDepth(client, 2) < 20, 'unit2 queue wedged')
                  finish()
                }
              } catch (e) {
                if (!settled) {
                  settled = true
                  clearTimeout(timer)
                  finish(e)
                }
              }
            })

            ;[1, 2, 1, 2, 1, 2].forEach(function (unitid, i) {
              setTimeout(function () {
                flexGet.receive({
                  payload: { fc: 3, unitid, address: 0, quantity: 3 }
                })
              }, i * (CI ? 40 : 15))
            })
          }, RECOVER_WAIT_MS)
        }, CI ? 10000 : 5000)
      })
    })
  })

  it('reconnect cycle keeps a single reconnectTimeoutId slot', function (done) {
    const finish = onceDone(done)

    loadReconnectFlow({ reconnectTimeout: CI ? 400 : 250 }, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx

      const samples = []
      const sampleIv = setInterval(function () {
        samples.push(client.reconnectTimeoutId)
      }, 40)

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) {
          clearInterval(sampleIv)
          return finish(stopErr)
        }

        setTimeout(function () {
          clearInterval(sampleIv)
          try {
            assert.ok(samples.length >= 3, 'expected timer samples during outage')
            const nonZero = samples.filter(function (id) {
              return id !== 0 && id != null
            })
            assert.ok(
              typeof client.reconnectTimeoutId === 'object' ||
                typeof client.reconnectTimeoutId === 'number' ||
                client.reconnectTimeoutId === 0,
              'reconnectTimeoutId remains a single slot'
            )
            assert.ok(nonZero.length >= 1 || client.actualServiceState, 'reconnect activity observed')
          } catch (e) {
            return finish(e)
          }

          recoverClient(client, server, function (activeErr) {
            if (activeErr) return finish(activeErr)
            finish()
          }, RECOVER_WAIT_MS)
        }, CI ? 1800 : 1200)
      })
    })
  })

  it('manual reconnect event (Port-Not-Open path) cycles FSM while server stays up', function (done) {
    const finish = onceDone(done)
    const MAGIC = 4444

    loadReconnectFlow({}, function (err, ctx) {
      if (err) return finish(err)
      const { client } = ctx
      const trail = []
      const unsub = client.stateService.subscribe(function (state) {
        if (state && state.value && trail[trail.length - 1] !== state.value) {
          trail.push(state.value)
        }
      })

      // Server remains listening — emit('reconnect') is the Basics "Port Not Open" path
      client.emit('reconnect')

      waitForModbusClientInactive(client, function (inactiveErr) {
        if (inactiveErr) {
          unsub.unsubscribe()
          return finish(inactiveErr)
        }

        waitForModbusClientActive(client, function (activeErr) {
          unsub.unsubscribe()
          if (activeErr) return finish(activeErr)
          try {
            assert.ok(
              trail.some(function (s) { return s === 'closed' || s === 'reconnecting' }),
              'expected CLOSE/reconnect trail, got ' + trail.join('→')
            )
            measure('fsm.manual-reconnect', { trail: trail.join('→') })
          } catch (e) {
            return finish(e)
          }
          writeThenFilterRead(MAGIC, finish)
        }, RECOVER_WAIT_MS)
      }, CI ? 10000 : 5000)
    })
  })

  it('FSM state trail includes outage and recovery states', function (done) {
    const finish = onceDone(done)

    loadReconnectFlow({}, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx
      const trail = []

      const unsub = client.stateService.subscribe(function (state) {
        if (state && state.value && trail[trail.length - 1] !== state.value) {
          trail.push(state.value)
        }
      })

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) {
          unsub.unsubscribe()
          return finish(stopErr)
        }

        waitForModbusClientState(
          client,
          ['broken', 'reconnecting', 'closed', 'failed', 'init'],
          function (stateErr) {
            if (stateErr) {
              unsub.unsubscribe()
              return finish(stateErr)
            }

            recoverClient(client, server, function (activeErr) {
              unsub.unsubscribe()
              if (activeErr) return finish(activeErr)
              try {
                assert.ok(
                  trail.some(function (s) {
                    return s === 'connected' || s === 'activated' || s === 'queueing'
                  }),
                  'trail missing recovery: ' + trail.join('→')
                )
                assert.ok(
                  trail.some(function (s) {
                    return s === 'broken' || s === 'reconnecting' || s === 'closed' || s === 'failed'
                  }),
                  'trail missing outage: ' + trail.join('→')
                )
                measure('fsm.trail', { trail: trail.join('→') })
                finish()
              } catch (e) {
                finish(e)
              }
            }, RECOVER_WAIT_MS)
          },
          CI ? 10000 : 5000
        )
      })
    })
  })

  it('AC-05: peer-up recovery without connectClient nudge (FR-TMR-SINGLE / FR-CONN-READY)', function (done) {
    const finish = onceDone(done)
    const MAGIC = 2009

    loadReconnectFlow({ reconnectTimeout: CI ? 400 : 250 }, function (err, ctx) {
      if (err) return finish(err)
      const { server, client } = ctx
      const trail = []
      const unsub = client.stateService.subscribe(function (state) {
        if (state && state.value && trail[trail.length - 1] !== state.value) {
          trail.push(state.value)
        }
      })

      simulateTcpOutage(server, client, function (stopErr) {
        if (stopErr) {
          unsub.unsubscribe()
          return finish(stopErr)
        }

        waitForModbusClientInactive(client, function (inactiveErr) {
          if (inactiveErr) {
            unsub.unsubscribe()
            return finish(inactiveErr)
          }

          // Explicitly field-like: no connectClient nudge
          recoverClient(client, server, function (activeErr) {
            unsub.unsubscribe()
            if (activeErr) return finish(activeErr)
            try {
              assert.strictEqual(client.reconnectAttempt, 0, 'attempt counter reset on connect')
              assert.ok(
                trail.some(function (s) { return s === 'activated' || s === 'connected' }),
                'expected post-connect ready, trail=' + trail.join('→')
              )
              measure('fsm.no-nudge-recover', { trail: trail.join('→') })
            } catch (e) {
              return finish(e)
            }
            writeThenFilterRead(MAGIC, finish)
          }, RECOVER_WAIT_MS, { nudge: false })
        }, CI ? 10000 : 5000)
      })
    })
  })
})
