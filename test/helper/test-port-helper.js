/**
 * Test port helper for dynamic port allocation
 * Prevents port conflicts in parallel test execution
 */

'use strict'

let currentPort = 30000 + Math.floor(Math.random() * 10000)

module.exports = {
  /**
   * Get a unique port for testing
   * @returns {number} A unique port number
   */
  getPort: function () {
    return currentPort++
  },

  /**
   * Reset port counter
   */
  reset: function () {
    currentPort = 30000 + Math.floor(Math.random() * 10000)
  }
}
