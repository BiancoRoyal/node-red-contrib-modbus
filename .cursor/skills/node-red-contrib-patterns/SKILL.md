---
name: node-red-contrib-patterns
description: P4NR Node-RED contribution patterns for node-red-contrib-modbus. Node structure, Mocha testing, build pipeline, FSM state, credentials, and StandardJS conventions. Use when implementing or reviewing nodes in this package.
---

# Node-RED Contrib Patterns — node-red-contrib-modbus v6

Project-specific conventions for `@plus4nodered/node-red-contrib-modbus` **v6 closed**.

## v6 vs v5 OSS

| | **v6 (this repo)** | **v5 OSS** |
|---|-------------------|------------|
| Path | `P4NR/modbus/node-red-contrib-modbus` | `BIANCO-ROYAL/node-red-contrib-modbus` |
| Package | `@plus4nodered/node-red-contrib-modbus` | `node-red-contrib-modbus` |
| TLS | `Modbus-Client-TLS` | — |
| Server | separate contrib-modbus-server pkg | in-package |
| Logging | `winston` | `debug` |
| Visibility | `private: true` | Open Source GitHub |

Do not backport v6 breaking changes to v5 without an explicit cross-repo decision.

## When to Use

- Implementing or reviewing any node in `src/modbus-*.js`
- Writing Mocha tests with `node-red-node-test-helper`
- Planning config properties, message contracts, or editor HTML
- Debugging build (`src/` → `modbus/`) or test failures

## Package Layout

```
src/modbus-<node>.js      # Runtime (author here)
src/modbus-<node>.html    # Editor UI + help
src/core/                 # Shared business logic
src/locales/              # i18n strings
modbus/                   # Built output (gulp/babel) — do not hand-edit
test/units/               # Mocha unit tests
test/e2e/                 # Mocha E2E tests
test/helper/              # Port helpers, extensions
```

Register nodes in `package.json` → `node-red.nodes`.

## Node Skeleton

```javascript
module.exports = function (RED) {
  'use strict'

  function MyNode (config) {
    RED.nodes.createNode(this, config)
    const node = this

    node.on('input', function (msg, send, done) {
      try {
        // validate msg, delegate to src/core/
        send(msg)
        if (done) done()
      } catch (err) {
        node.error(err, msg)
        if (done) done(err)
      }
    })
  }

  RED.nodes.registerType('modbus-my-node', MyNode)
}
```

## Build Pipeline

1. Edit `src/`
2. `npm run lint` (StandardJS)
3. `npm run build` (gulp → `modbus/`)
4. Run tests against built or src paths per existing test style

Tests often `require('../../src/modbus-client.js')` directly — follow sibling test files.

## Testing Pattern

```javascript
'use strict'
const helper = require('node-red-node-test-helper')
const nodeUnderTest = require('../../src/modbus-client.js')

helper.init(require.resolve('node-red'))

describe('My node', function () {
  before(function (done) { helper.startServer(done) })
  after(function (done) { helper.stopServer(done) })
  afterEach(function (done) {
    helper.unload().then(() => done()).catch(() => done())
  })

  it('should ...', function (done) {
    const flow = [/* node-red flow JSON */]
    helper.load(nodeUnderTest, flow, function () {
      const n = helper.getNode('node-id')
      // assert behavior
      done()
    })
  })
})
```

- Dynamic TCP ports: `getPort()` from `test/helper/test-helper-extensions.js`
- Flow fixtures: `test/units/flows/`, `test/e2e/flows/`
- **Always Mocha** for Node-RED nodes — Jest is not compatible with test-helper here

## Client / Connection Nodes

- Use `@openp4nr/node-modbus` for Modbus client
- XState FSM (`@xstate/fsm`) for connection lifecycle in client nodes
- Core logic in `src/core/modbus-client-core.js`, `modbus-queue-core.js`
- Config node pattern: `modbus-io-config` referenced by read/write nodes

## Message Conventions

- `msg.payload` — register data or command payload
- `msg.topic` — often used for routing / logging
- Unit ID via config or `msg` depending on node
- Errors: `node.error(err, msg)` — do not throw uncaught from `on('input')`
- Use `modbus-basics` helpers for shared message shaping

## Credentials & Security

- Store connection secrets in Node-RED credential API (`node.credentials`), not in flow JSON
- TLS: follow `modbus-client-tls` patterns, `node-forge` for certs
- Validate numeric ranges (unitId, FC, address, quantity) before sending to bus
- Never log passwords or private keys; use `contribModbus*` debug namespaces

## Code Style (StandardJS)

- No semicolons, 2-space indent, single quotes
- `'use strict'` at top of runtime files
- `// SOURCE-MAP-REQUIRED` where existing files use it
- Prefer `src/core/` over duplicating logic across nodes

## Server Nodes

Server functionality lives in **`@plus4nodered/node-red-contrib-modbus-server`** — do not add server nodes to this package.

## Debug

```bash
DEBUG=contribModbus* npm run test:units
DEBUG=contribModbus:config:client node-red -v
```

## Common Commands

```bash
npm run build
npm run lint
npm test
npm run test:units
npm run test:e2e
npm run mocha:base -- test/units/modbus-client-test.js
npm run coverage
```

## Related Agents

- Specs: `p4nr-spec-author`
- Review: `p4nr-spec-reviewer`
- Code: `p4nr-developer`
