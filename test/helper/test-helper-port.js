const net = require('net')
const address = require('address')
const core = require('../../src/core/modbus-core')

if (!global.portList) {
  global.portList = [0]
}

class PortHelper {
  startPort = 0

  getRandomArbitrary (min, max) {
    return Math.floor(Math.random() * (max - min) + min)
  }

  init (min, max) {
    this.startPort = this.getRandomArbitrary(min, max)
  }

  findPortDuplicates = async () => {
    let isDuplicate = false

    isDuplicate = await new Promise((resolve) => {
      for (let i = 0; i < global.portList.length; i++) {
        isDuplicate = global.portList.some((element, index) => {
          return global.portList.indexOf(element) !== index
        })

        if (isDuplicate) {
          return resolve(true)
        }
      }

      return resolve(false)
    })

    return isDuplicate
  }

  getPort = () => {
    if (this.startPort === 0 || this.startPort >= 45000 || this.startPort <= 20000) {
      this.init(20000, 45000)
    } else {
      this.startPort = this.getRandomArbitrary(this.startPort + this.getRandomArbitrary(3, 12), 50000)
    }

    if (global.portList.includes(this.startPort)) {
      this.startPort = this.getPort()
    }

    global.portList.push(this.startPort)
    return this.startPort
  }

  tryListen (port, maxPort, hostname, callback) {
    if (typeof callback !== 'function') {
      throw new Error('callback needs to be function on try listen')
    }

    if (hostname) {
      this.listen(port, hostname, (err, realPort) => {
        if (err) {
          if (err.code === 'EADDRNOTAVAIL') {
            return callback(new Error('the ip that is not unknown on the machine'), realPort)
          }
          return this.handleError(port, maxPort, hostname, callback)
        }

        callback(null, realPort)
      })
    } else {
      // 1. check null
      this.listen(port, null, (err, realPort) => {
        // ignore random listening
        if (port === 0) {
          return callback(err, realPort)
        }

        if (err) {
          return this.handleError(err, port, maxPort, hostname, callback)
        }

        // 2. check 0.0.0.0
        this.listen(port, '0.0.0.0', (err, realPort) => {
          if (err) {
            return this.handleError(err, port, maxPort, hostname, callback)
          }

          // 3. check localhost
          this.listen(port, 'localhost', (err, realPort) => {
            // if localhost refer to the ip that is not unkonwn on the machine, you will see the error EADDRNOTAVAIL
            // https://stackoverflow.com/questions/10809740/listen-eaddrnotavail-error-in-node-js
            if (err && err.code !== 'EADDRNOTAVAIL') {
              return this.handleError(err)
            }

            // 4. check current ip
            this.listen(port, address.ip(), (err, realPort) => {
              if (err) {
                return this.handleError(err, port, maxPort, hostname, callback)
              }

              callback(null, realPort)
            })
          })
        })
      })
    }
  }

  handleError (err, port, maxPort, hostname, callback) {
    if (typeof callback !== 'function') {
      throw new Error('callback needs to be function on handle error')
    }

    core.internalDebug('actual test port error: ' + err.message, [{ topic: 'testing port' }], err)

    port++
    if (port >= maxPort) {
      port = 0
      maxPort = 0
    }

    this.tryListen(port, maxPort, hostname, callback)
  }

  listen (port, hostname, callback) {
    if (typeof callback !== 'function') {
      throw new Error('callback needs to be function on listen')
    }
    const server = new net.Server()

    server.on('error', (err) => {
      try {
        server.close()
      } catch (e) {
        core.internalDebug('server close error: ' + err.message, [{ topic: 'testing port' }], err)
      }

      if (err.code === 'ENOTFOUND') {
        return callback(null, port)
      }

      return callback(err, port)
    })

    server.listen(port, hostname, () => {
      try {
        port = server.address().port
        server.close()
      } catch (err) {
        core.internalDebug('server close error: ' + err.message, [{ topic: 'testing port' }], err)
      }

      return callback(null, port)
    })
  }

  tearDown () {
    this.startPort = 0
    core.internalDebug('Port List: ' + global.portList, [{ topic: 'testing port list' }])
    global.portList = []
  }
}

module.exports = {
  PortHelper
}
