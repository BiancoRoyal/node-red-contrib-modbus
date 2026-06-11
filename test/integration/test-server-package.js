/**
 * Test to verify that the server package is properly installed and accessible
 */

'use strict'

const assert = require('assert')

describe('Server Package Integration', function () {
  it('should be able to load modbus-server from the separate package', function () {
    const serverNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server')
    assert(serverNode, 'Server node should be loadable from the package')
    assert(typeof serverNode === 'function', 'Server node should export a function')
  })

  it('should be able to load modbus-server-demo from the separate package', function () {
    const serverDemoNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-demo')
    assert(serverDemoNode, 'Server demo node should be loadable from the package')
    assert(typeof serverDemoNode === 'function', 'Server demo node should export a function')
  })

  it('should be able to load modbus-server-tls from the separate package', function () {
    const serverTlsNode = require('@plus4nodered/node-red-contrib-modbus-server/modbus/modbus-server-tls')
    assert(serverTlsNode, 'Server TLS node should be loadable from the package')
    assert(typeof serverTlsNode === 'function', 'Server TLS node should export a function')
  })

  it('should verify that jsmodbus is NOT in the main package dependencies', function () {
    const mainPackage = require('../../package.json')
    assert(!mainPackage.dependencies.jsmodbus, 'jsmodbus should not be in main package dependencies')
    assert(!mainPackage.devDependencies.jsmodbus, 'jsmodbus should not be in main package devDependencies')
  })

  it('should verify the server package is in devDependencies', function () {
    const mainPackage = require('../../package.json')
    assert(mainPackage.devDependencies['@plus4nodered/node-red-contrib-modbus-server'], 'Server package should be in devDependencies')
  })
})
