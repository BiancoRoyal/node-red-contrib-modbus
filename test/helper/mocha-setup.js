'use strict'

// Node.js >= 19 keeps sockets of the global agent alive. supertest starts a short-lived
// server on an ephemeral port per request; under parallel load a port is reused and a
// pooled socket of the closed server answers with "socket hang up". Tests use fresh sockets.
const http = require('http')

http.globalAgent = new http.Agent({ keepAlive: false })
