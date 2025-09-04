/**
 * Enhanced Port Helper with Conflict Prevention
 * Comprehensive port management for Node-RED Modbus tests
 * Prevents port conflicts that cause test crashes and timeouts
 */

'use strict'

const net = require('net')
const crypto = require('crypto')

/**
 * Enhanced Port Helper with better conflict prevention
 */
class EnhancedPortHelper {
  constructor () {
    this.usedPorts = new Set()
    this.reservedPorts = new Map() // testId -> port mappings
    this.startPort = 20000
    this.endPort = 45000
    this.maxAttempts = 100
  }

  /**
   * Get an available port with comprehensive conflict checking
   */
  async getPort (testId = null) {
    if (testId && this.reservedPorts.has(testId)) {
      return this.reservedPorts.get(testId)
    }

    let attempts = 0
    let port

    while (attempts < this.maxAttempts) {
      port = this.generatePort()

      // Skip if already used
      if (this.usedPorts.has(port)) {
        attempts++
        continue
      }

      // Test if port is actually available
      const isAvailable = await this.testPortAvailability(port)
      if (isAvailable) {
        this.usedPorts.add(port)
        if (testId) {
          this.reservedPorts.set(testId, port)
        }
        return port
      }

      attempts++
    }

    throw new Error(`Unable to find available port after ${this.maxAttempts} attempts`)
  }

  /**
   * Generate a random port within safe range
   */
  generatePort () {
    // Use crypto for better randomness
    const randomBytes = crypto.randomBytes(4)
    const random = randomBytes.readUInt32BE(0) / 0xFFFFFFFF
    const range = this.endPort - this.startPort
    return Math.floor(this.startPort + (random * range))
  }

  /**
   * Test if a port is actually available by trying to bind to it
   */
  async testPortAvailability (port) {
    return new Promise((resolve) => {
      const server = net.createServer()

      server.listen(port, '127.0.0.1', () => {
        server.close(() => resolve(true))
      })

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
          resolve(false)
        } else {
          // Other errors also mean port is not available
          resolve(false)
        }
      })

      // Timeout fallback
      setTimeout(() => {
        server.close()
        resolve(false)
      }, 100)
    })
  }

  /**
   * Release a port (mark as available for reuse)
   */
  releasePort (port, testId = null) {
    this.usedPorts.delete(port)
    if (testId && this.reservedPorts.has(testId)) {
      this.reservedPorts.delete(testId)
    }
  }

  /**
   * Get multiple ports for a test (e.g., client and server)
   */
  async getMultiplePorts (count, testId = null) {
    const ports = []

    for (let i = 0; i < count; i++) {
      const port = await this.getPort(`${testId}-${i}`)
      ports.push(port)
    }

    return ports
  }

  /**
   * Reserve a port range for a test suite
   */
  async reservePortRange (count, suiteId) {
    const ports = []
    const basePort = this.generatePort()

    for (let i = 0; i < count; i++) {
      let port = basePort + i

      // Ensure port is in valid range
      if (port > this.endPort) {
        port = this.startPort + i
      }

      const isAvailable = await this.testPortAvailability(port)
      if (isAvailable) {
        this.usedPorts.add(port)
        this.reservedPorts.set(`${suiteId}-${i}`, port)
        ports.push(port)
      } else {
        // If any port in range is not available, start over
        return this.getMultiplePorts(count, suiteId)
      }
    }

    return ports
  }

  /**
   * Clean up all ports for a test or test suite
   */
  cleanup (testIdPrefix = null) {
    if (testIdPrefix) {
      // Clean up specific test
      for (const [id, port] of this.reservedPorts) {
        if (id.startsWith(testIdPrefix)) {
          this.usedPorts.delete(port)
          this.reservedPorts.delete(id)
        }
      }
    } else {
      // Clean up everything
      this.usedPorts.clear()
      this.reservedPorts.clear()
    }
  }

  /**
   * Get statistics about port usage
   */
  getStats () {
    return {
      usedPorts: Array.from(this.usedPorts).sort((a, b) => a - b),
      reservedPorts: Object.fromEntries(this.reservedPorts),
      availableRange: `${this.startPort}-${this.endPort}`,
      totalUsed: this.usedPorts.size,
      totalReserved: this.reservedPorts.size
    }
  }

  /**
   * Wait for a port to become available (useful for cleanup)
   */
  async waitForPortRelease (port, maxWait = 5000) {
    const startTime = Date.now()

    while (Date.now() - startTime < maxWait) {
      const isAvailable = await this.testPortAvailability(port)
      if (isAvailable) {
        return true
      }

      // Wait a bit before trying again
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    return false
  }

  /**
   * Force release a port by attempting to connect and close
   */
  async forceReleasePort (port) {
    return new Promise((resolve) => {
      const socket = new net.Socket()

      socket.setTimeout(100)

      socket.connect(port, '127.0.0.1', () => {
        socket.destroy()
        resolve(true)
      })

      socket.on('error', () => {
        socket.destroy()
        resolve(false)
      })

      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
    })
  }
}

/**
 * Global port helper instance
 */
const globalPortHelper = new EnhancedPortHelper()

/**
 * Helper functions for easy usage in tests
 */
module.exports = {
  EnhancedPortHelper,

  // Easy access functions
  getPort: (testId) => globalPortHelper.getPort(testId),
  getMultiplePorts: (count, testId) => globalPortHelper.getMultiplePorts(count, testId),
  reservePortRange: (count, suiteId) => globalPortHelper.reservePortRange(count, suiteId),
  releasePort: (port, testId) => globalPortHelper.releasePort(port, testId),
  cleanup: (testIdPrefix) => globalPortHelper.cleanup(testIdPrefix),
  waitForPortRelease: (port, maxWait) => globalPortHelper.waitForPortRelease(port, maxWait),
  getStats: () => globalPortHelper.getStats(),

  // Access to global instance
  globalPortHelper
}
