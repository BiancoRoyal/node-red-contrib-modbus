# AGENTS.md

## Cursor Cloud specific instructions

This repository is the Node-RED contribution package **`node-red-contrib-modbus`** (a set
of Modbus TCP/UDP/Serial nodes for Node-RED). It is a library, not a standalone app: the
"application" is Node-RED itself with these nodes loaded.

Dependencies are installed with `npm install` (the startup update script already does this;
both `package-lock.json`/npm and a `yarn.lock` exist, but CI and `.drone.yml` use npm, so
prefer npm). Node.js >= 18.5 is required; the VM has a compatible Node.

Standard commands live in `package.json` scripts — use those rather than reinventing:
- Lint: `npm run lint` (runs `standard --fix`).
- Test: `npm test` (lint + `mocha --parallel --timeout 6000`).
- Build: `npm run build` (lint + `gulp`), which compiles `src/` into the `modbus/` directory.

Non-obvious caveats:
- **Tests are designed for parallel mode.** Always use `npm test` (which passes
  `--parallel`). Running mocha non-parallel (e.g. with a single long timeout) makes
  timing-sensitive specs in `test/units/modbus-write-test.js` time out. That is an artifact
  of the test design, not a real failure.
- **Suite should be fully green** (`438 passing`) under `npm test`. Two historical
  parallel-only flaky races were fixed; keep them from regressing:
  - Test fixtures for `modbus-io-config` must point `path` at a **real file**
    (e.g. `./test/resources/device.json`), never at a directory like `test` — the IO
    line-reader does an async read that throws `EISDIR` and surfaces as
    `done() called multiple times` once `unload()` removes its listeners.
  - Do not assert on `modbus-client` readiness/FSM by calling `setNodeStatusTo(...)`
    (that only changes the cosmetic status). `isReadyToSend()` reads the real
    `actualServiceState`; drive it deterministically via
    `node.stateMachine.transition(...)` instead of waiting on a live connection.
- **Lint and build mutate files.** `standard --fix` may auto-edit sources, and `gulp`
  rewrites `CHANGELOG.md` and regenerates the (gitignored) `modbus/` output. `git checkout --`
  any unintended generated changes before committing.
- The `modbus/` build output is gitignored; the package's `node-red` node entries point at
  `modbus/*.js`, so you must run `npm run build` before loading the package into Node-RED.

Running the package end-to-end (as Node-RED nodes):
1. `npm run build` to generate `modbus/`.
2. Make a Node-RED user dir and symlink the repo into it, e.g.
   `mkdir -p ~/nrtest/node_modules && ln -sfn "$PWD" ~/nrtest/node_modules/node-red-contrib-modbus`.
3. Start Node-RED on the repo's local install:
   `./node_modules/.bin/node-red --userDir ~/nrtest --port 1880`.
4. Open `http://127.0.0.1:1880`; the 13 Modbus node types appear in the palette.
   A good smoke test is a flow with a `modbus-server` (TCP), a `modbus-client`, a
   `modbus-flex-write` (FC16) and a `modbus-read` — write known values and confirm the
   read polls them back. Note the `modbus-server` node uses an internal buffer factor, so
   writing into it via its own input node does not map 1:1 to plain register byte offsets;
   to write known values use the protocol-level `modbus-flex-write`/`modbus-write` nodes.
