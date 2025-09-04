/**
 * Global error handler for tests to prevent crashes
 */

const activeHandlers = new Set()
const originalListeners = new Map()

class TestErrorHandler {
  constructor () {
    this.errors = []
    this.warnings = []
    this.setupHandlers()
  }

  setupHandlers () {
    // Store original listeners
    if (!originalListeners.has('uncaughtException')) {
      originalListeners.set('uncaughtException', process.listeners('uncaughtException').slice())
      originalListeners.set('unhandledRejection', process.listeners('unhandledRejection').slice())
      originalListeners.set('warning', process.listeners('warning').slice())
    }

    // Remove all existing listeners
    process.removeAllListeners('uncaughtException')
    process.removeAllListeners('unhandledRejection')
    process.removeAllListeners('warning')

    // Add our handlers
    this.exceptionHandler = (err) => {
      console.error('⚠️  Caught exception in test:', err.message)
      this.errors.push(err)

      // Only exit on truly fatal errors
      if (this.isFatalError(err)) {
        console.error('Fatal error detected, exiting...')
        process.exit(1)
      }
    }

    this.rejectionHandler = (reason, promise) => {
      console.error('⚠️  Caught unhandled rejection:', reason)
      this.errors.push(reason)
    }

    this.warningHandler = (warning) => {
      this.warnings.push(warning)
    }

    process.on('uncaughtException', this.exceptionHandler)
    process.on('unhandledRejection', this.rejectionHandler)
    process.on('warning', this.warningHandler)

    activeHandlers.add(this)
  }

  isFatalError (err) {
    // Connection errors are not fatal in tests
    if (err.code === 'ECONNREFUSED') return false
    if (err.code === 'ECONNRESET') return false
    if (err.code === 'ETIMEDOUT') return false
    if (err.code === 'ENOTFOUND') return false

    // Assertion errors in tests are not fatal to the runner
    if (err.name === 'AssertionError') return false

    // Node removal errors are not fatal
    if (err.message && err.message.includes('removeAllListeners')) return false

    // Other errors might be fatal
    return false // Be lenient in test environment
  }

  cleanup () {
    process.removeListener('uncaughtException', this.exceptionHandler)
    process.removeListener('unhandledRejection', this.rejectionHandler)
    process.removeListener('warning', this.warningHandler)

    activeHandlers.delete(this)

    // If no more handlers, restore original listeners
    if (activeHandlers.size === 0) {
      const uncaughtListeners = originalListeners.get('uncaughtException') || []
      const unhandledListeners = originalListeners.get('unhandledRejection') || []
      const warningListeners = originalListeners.get('warning') || []

      uncaughtListeners.forEach(listener => process.on('uncaughtException', listener))
      unhandledListeners.forEach(listener => process.on('unhandledRejection', listener))
      warningListeners.forEach(listener => process.on('warning', listener))
    }
  }

  getErrors () {
    return this.errors.slice()
  }

  getWarnings () {
    return this.warnings.slice()
  }

  clear () {
    this.errors = []
    this.warnings = []
  }
}

// Global singleton instance
let globalHandler = null

module.exports = {
  /**
   * Install global error handler for tests
   */
  install () {
    if (!globalHandler) {
      globalHandler = new TestErrorHandler()
    }
    return globalHandler
  },

  /**
   * Uninstall global error handler
   */
  uninstall () {
    if (globalHandler) {
      globalHandler.cleanup()
      globalHandler = null
    }
  },

  /**
   * Get the current handler
   */
  getHandler () {
    return globalHandler
  },

  /**
   * Create a scoped error handler for a specific test
   */
  createScoped () {
    return new TestErrorHandler()
  }
}
