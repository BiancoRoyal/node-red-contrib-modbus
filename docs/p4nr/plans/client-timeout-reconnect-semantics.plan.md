# Plan: client-timeout-reconnect-semantics (5.60.3)

**Spec:** `docs/p4nr/capabilities/client-timeout-reconnect-semantics.md`
**Target:** `support/v5.60` → **5.60.3**
**Date:** 2026-10-20

---

## TDD Order

### Step 1 — Failing unit tests for `isApplicationTimeoutError` (AC-SEM-04)

File: `test/units/modbus-client-core-test.js`

Add a `describe('isApplicationTimeoutError', ...)` block with the full boundary
table from spec §10. Tests MUST fail (function not yet exported) before Step 2.

Boundary cases to cover:

| Input | Expected |
|-------|----------|
| `new Error('Timed out')` | `true` |
| `new Error('Port Timed out after 500ms')` | `true` |
| `{ message: 'Timed out', errno: 'ETIMEDOUT' }` | `false` |
| `{ message: 'Timed out', code: 'ESOCKETTIMEDOUT' }` | `false` |
| `{ message: 'error', errno: 'ECONNRESET' }` | `false` |
| `null` | `false` |
| `{}` | `false` |
| `{ message: '' }` | `false` |

### Step 2 — Implement `isApplicationTimeoutError` in core (makes Step 1 green)

File: `src/core/modbus-client-core.js`

Add after `isRecoverableModbusError` (currently ends around line 66):

```js
/**
 * Returns true when err is a pure application-level "Timed out" from
 * modbus-serial — no transport errno/code present.
 * Used by modbusErrorHandling to honour reconnectOnTimeout=false
 * (FR-SEM-SPLIT — client-timeout-reconnect-semantics).
 */
coreClient.isApplicationTimeoutError = function (err) {
  if (!err) return false
  const msg = (err.message && String(err.message)) || ''
  if (msg.indexOf('Timed out') === -1) return false
  // If errno/code is a transport error, treat it as transport (always recover)
  if (err.errno && coreClient.networkErrors.includes(err.errno)) return false
  if (err.code && coreClient.networkErrors.includes(err.code)) return false
  return true
}
```

Run `npm run build` after this change.

### Step 3 — Failing unit tests for `modbusErrorHandling` behaviour (AC-SEM-01, -02, -03, -05)

File: `test/units/modbus-client-test.js`

Add a `describe('modbusErrorHandling reconnectOnTimeout semantics', ...)` block.
Use sinon to spy on `node.stateService.send`.

Test cases (MUST fail before Step 4 because guard is not yet in place):

1. **`reconnectOnTimeout=false` + application timeout → no FAILURE sent**
   ```js
   it('should NOT send FAILURE for Timed out when reconnectOnTimeout is false', function (done) {
     // build node with reconnectOnTimeout: false, serialSendingAllowed: false
     // spy on stateService.send
     node.modbusErrorHandling(new Error('Timed out'))
     assert.strictEqual(sendSpy.called, false)
     assert.strictEqual(node.serialSendingAllowed, true) // queue unlocked
     done()
   })
   ```

2. **`reconnectOnTimeout=true` + application timeout → FAILURE sent**
   ```js
   it('should send FAILURE for Timed out when reconnectOnTimeout is true', function (done) {
     // build node with reconnectOnTimeout: true
     node.modbusErrorHandling(new Error('Timed out'))
     assert.strictEqual(sendSpy.calledOnceWith('FAILURE'), true)
     done()
   })
   ```

3. **`reconnectOnTimeout=false` + transport error → FAILURE sent**
   ```js
   it('should send FAILURE for transport error even when reconnectOnTimeout is false', function (done) {
     // build node with reconnectOnTimeout: false
     const transportErr = new Error('socket error')
     transportErr.errno = 'ECONNRESET'
     node.modbusErrorHandling(transportErr)
     assert.strictEqual(sendSpy.calledWith('FAILURE'), true)
     done()
   })
   ```

4. **`reconnectOnTimeout=false` + suppressed timeout → FSM stays in `activated`**
   (If FSM is fully integrated in test helper, assert state value; otherwise spy only
   — assert `stateService.send` not called.)

### Step 4 — Implement guard in `modbusErrorHandling` (makes Step 3 green)

File: `src/modbus-client.js`

In `node.modbusErrorHandling` (around line 520), add the guard **after**
`queueSerialUnlockCommand` and **before** the `isRecoverableModbusError` check:

```js
node.modbusErrorHandling = function (err) {
  coreModbusQueue.queueSerialUnlockCommand(node)
  if (err.message) {
    coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + err.message)
  } else {
    coreModbusClient.modbusSerialDebug('modbusErrorHandling:' + JSON.stringify(err))
  }
  // FR-SEM-SUPPRESS: when reconnectOnTimeout is false, application-level timeouts
  // must fail the command only — do not rebuild the connection.
  if (!node.reconnectOnTimeout && coreModbusClient.isApplicationTimeoutError(err)) {
    coreModbusClient.modbusSerialDebug('modbusErrorHandling: application timeout suppressed (reconnectOnTimeout=false)')
    return
  }
  // FR-TO-01 / FR-TO-02: Timed out, DNS (EAI_AGAIN), and network errno → FAILURE
  if (coreModbusClient.isRecoverableModbusError(err)) {
    node.stateService.send('FAILURE')
  }
}
```

Run `npm run build` after this change.

### Step 5 — Verify regression guard (AC-SEM-06, AC-SEM-07)

Run existing honesty and recovery unit/e2e suites:

```bash
npm run mocha:base -- test/units/modbus-client-test.js
npm run mocha:base -- test/units/modbus-client-core-test.js
npm run mocha:base -- test/e2e/modbus-fsm-reconnect-e2e-test.js
```

All prior ACs (honesty AC-01..08, recovery AC-01..07) MUST remain green.

### Step 6 — CHANGELOG and version bump (AC-SEM-08)

File: `CHANGELOG.md`

Add under `[Unreleased]` → `### Fixed`:
```
- Fix #586: `reconnectOnTimeout=false` now correctly suppresses connection rebuild
  on application "Timed out" errors; transport errors (ECONNRESET, closed serial,
  etc.) still trigger recovery. Shared gateway reconnect storms caused by slow
  unit IDs also addressed (#580).
```

File: `package.json` — bump `"version"` to `"5.60.3"`.

### Step 7 — Final build gate (AC-SEM-08)

```bash
npm run build
npm test
```

All suites must pass. Build output must be clean.

---

## Files

| File | Action |
|------|--------|
| `src/core/modbus-client-core.js` | Add `isApplicationTimeoutError` (Step 2) |
| `src/modbus-client.js` | Guard in `modbusErrorHandling` (Step 4) |
| `test/units/modbus-client-core-test.js` | `isApplicationTimeoutError` boundary tests (Step 1) |
| `test/units/modbus-client-test.js` | `modbusErrorHandling` semantics tests (Step 3) |
| `CHANGELOG.md` | 5.60.3 Fixed entry (Step 6) |
| `package.json` | Version 5.60.3 (Step 6) |
| `docs/p4nr/README.md` | Active capabilities table row |

---

## Non-Goals

- Do NOT modify `modbusTcpErrorHandling` or `modbusSerialErrorHandling`
- Do NOT modify `isRecoverableModbusError` (additive change only)
- Do NOT modify HTML / locale files (no new palette options)
- Do NOT restore Fake-Ready / in-band `connectClient`
- Do NOT change `broken` handler routing (INIT vs RECONNECT remains correct for transport errors)
- #577 Serial RTU ARM64 Node 24 remains a separate capability
