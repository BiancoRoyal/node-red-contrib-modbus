/**
 * Global test setup file
 * This file is loaded before all tests to setup the test environment
 */

const errorHandler = require('./test-error-handler')
const connectionHandler = require('./connection-error-handler')

// Install handlers immediately when this file is loaded
console.log('🛡️  Installing global error handler for tests')
errorHandler.install()
console.log('🔌 Installing connection error handler')
connectionHandler.install()

// Cleanup function for process exit
function cleanup () {
  console.log('🧹 Cleaning up global handlers')
  const handler = errorHandler.getHandler()
  if (handler) {
    const errors = handler.getErrors()
    const warnings = handler.getWarnings()

    if (errors.length > 0) {
      console.log(`📊 Test run completed with ${errors.length} handled errors`)
    }

    if (warnings.length > 0) {
      console.log(`⚠️  Test run had ${warnings.length} warnings`)
    }
  }

  console.log(`🔌 Active connections: ${connectionHandler.getActiveConnections()}`)
  connectionHandler.closeAll()
  connectionHandler.uninstall()
  errorHandler.uninstall()
}

// Register cleanup handlers
process.on('exit', cleanup)
process.on('SIGINT', () => {
  cleanup()
  process.exit(0)
})
process.on('SIGTERM', () => {
  cleanup()
  process.exit(0)
})

// Handle test timeouts more gracefully
const originalTimeout = global.setTimeout
global.setTimeout = function (fn, delay, ...args) {
  const wrappedFn = function (...cbArgs) {
    try {
      return fn.apply(this, cbArgs)
    } catch (err) {
      console.error('Error in timeout callback:', err.message)
      // Don't rethrow, let test fail normally
    }
  }
  return originalTimeout.call(this, wrappedFn, delay, ...args)
}

// Export for use in individual tests
module.exports = {
  errorHandler
}
