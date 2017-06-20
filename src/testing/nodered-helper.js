/**
 * Original Work Copyright 2014 IBM Corp.
 * node-red
 *
 * Copyright (c) 2016, Klaus Landsdorf (http://bianco-royal.de/)
 * Copyright 2016-2017 Klaus Landsdorf (http://bianco-royal.de/)
 * All rights reserved.
 * node-red-contrib-modbus - The BSD 3-Clause License
 *
 * Licensed under the Apache License, Version 2.0 (the "License")
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

var should = require('should')
var sinon = require('sinon')
var when = require('when')
var request = require('supertest')

var nock
if (!process.version.match(/^v0\.[0-9]\./)) {
    // only set nock for node >= 0.10
  try {
    nock = require('nock')
  } catch (err) {
        // nevermind, will skip nock tests
    nock = null
  }
}

var RED = require('node-red/red/red.js')
var redNodes = require('node-red/red/runtime/nodes')
var flows = require('node-red/red/runtime/nodes/flows')
var credentials = require('node-red/red/runtime/nodes/credentials')
var comms = require('node-red/red/api/comms.js')
var log = require('node-red/red/runtime/log.js')

var express = require('express')
var http = require('http')
var app = express()

var address = '127.0.0.1'
var listenPort = 0 // use ephemeral port
var port
var url
var logSpy
var server

function helperNode (n) {
  RED.nodes.createNode(this, n)
}

module.exports = {
  load: function (testNode, testFlows, testCredentials, cb) {
    logSpy = sinon.spy(log, 'log')
    logSpy.FATAL = log.FATAL
    logSpy.ERROR = log.ERROR
    logSpy.WARN = log.WARN
    logSpy.INFO = log.INFO
    logSpy.DEBUG = log.DEBUG
    logSpy.TRACE = log.TRACE
    logSpy.METRIC = log.METRIC

    if (typeof testCredentials === 'function' || !cb) {
      cb = testCredentials
      testCredentials = {}
    }

    var storage = {
      getFlows: function () {
        var defer = when.defer()
        defer.resolve(testFlows)
        return defer.promise
      },
      getCredentials: function () {
        var defer = when.defer()
        defer.resolve(testCredentials)
        return defer.promise
      },
      saveCredentials: function () {
                // do nothing
      }
    }
    var settings = {
      available: function () {
        return false
      }
    }

    var red = {}
    for (var i in RED) {
      if (RED.hasOwnProperty(i) && !/^(init|start|stop)$/.test(i)) {
        var propDescriptor = Object.getOwnPropertyDescriptor(RED, i)
        Object.defineProperty(red, i, propDescriptor)
      }
    }

    red['_'] = function (messageId) {
      return messageId
    }

    redNodes.init({settings: settings, storage: storage, log: log})
    credentials.init(storage, express())
    RED.nodes.registerType('helper', helperNode)

    if (Array.isArray(testNode)) {
      for (var n = 0; n < testNode.length; n++) {
        testNode[n](red)
      }
    } else {
      testNode(red)
    }
    flows.load().then(function () {
      flows.startFlows()
      should.deepEqual(testFlows, flows.getFlows())
      cb()
    })
  },
  unload: function () {
        // TODO: any other state to remove between tests?
    redNodes.clearRegistry()
    if (logSpy) {
      logSpy.restore()
    }
    return flows.stopFlows()
  },

  getNode: function (id) {
    return flows.get(id)
  },

  credentials: credentials,

  clearFlows: function () {
    return flows.stopFlows()
  },

  request: function () {
    return request(RED.httpAdmin)
  },

  startServer: function (done) {
    server = http.createServer(function (req, res) {
      app(req, res)
    })
    RED.init(server, {
      SKIP_BUILD_CHECK: true,
      logging: {console: {level: 'off'}}
    })
    server.listen(listenPort, address)
    server.on('listening', function () {
      port = server.address().port
      url = 'http://' + address + ':' + port
      comms.start()
      done()
    })
  },
    // TODO consider saving TCP handshake/server reinit on start/stop/start sequences
  stopServer: function (done) {
    if (server) {
      try {
        server.close(done)
      } catch (e) {
        done()
      }
    }
  },

  url: function () {
    return url
  },

  nock: nock,

  log: function () {
    return logSpy
  }
}
