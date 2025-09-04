/**
 * Connection error handler for tests
 * Prevents ECONNREFUSED and similar errors from crashing tests
 */

const net = require('net')
const EventEmitter = require('events')

// Store original methods
const originalConnect = net.Socket.prototype.connect
const originalEmit = EventEmitter.prototype.emit

// Track connections
const activeConnections = new Map()

/**
 * Install connection error handling
 */
function install () {
  // Override Socket.connect to add error handling
  net.Socket.prototype.connect = function (...args) {
    const socket = this
    const connectionId = `conn-${Date.now()}-${Math.random()}`

    // Track this connection
    activeConnections.set(connectionId, socket)

    // Add error handler if none exists
    if (socket.listenerCount('error') === 0) {
      socket.on('error', (err) => {
        if (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT') {
          console.log(`⚠️  Connection error suppressed in test: ${err.code} ${err.address}:${err.port}`)
        }
      })
    }

    // Clean up on close
    socket.once('close', () => {
      activeConnections.delete(connectionId)
    })

    // Call original connect
    return originalConnect.apply(this, args)
  }

  // Override EventEmitter.emit to catch uncaught errors
  EventEmitter.prototype.emit = function (event, ...args) {
    if (event === 'error' && this.listenerCount('error') === 0) {
      const err = args[0]
      if (err && (err.code === 'ECONNREFUSED' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT')) {
        console.log(`⚠️  Unhandled connection error suppressed: ${err.code}`)
        return false // Prevent uncaught exception
      }
    }
    return originalEmit.apply(this, args)
  }
}

/**
 * Uninstall connection error handling
 */
function uninstall () {
  // Restore original methods
  net.Socket.prototype.connect = originalConnect
  EventEmitter.prototype.emit = originalEmit

  // Close all active connections
  for (const [, socket] of activeConnections) {
    try {
      socket.destroy()
    } catch (e) {
      // Ignore
    }
  }
  activeConnections.clear()
}

/**
 * Force close all active connections
 */
function closeAll () {
  for (const [, socket] of activeConnections) {
    try {
      socket.destroy()
    } catch (e) {
      // Ignore
    }
  }
  activeConnections.clear()
}

module.exports = {
  install,
  uninstall,
  closeAll,
  getActiveConnections: () => activeConnections.size
}
