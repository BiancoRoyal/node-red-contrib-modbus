# Capability Spec: Client Timeout / Reconnect Semantics (#586)

**Spec ID:** `client-timeout-reconnect-semantics`
**Version:** v5 OSS LTS (`node-red-contrib-modbus` 5.x)
**Status:** READY FOR REVIEW
**Author:** p4nr-spec-author (Team 1)
**Date:** 2026-10-20
**Related:** GitHub #586 (P0 — reconnect on timeout checkbox ignored), #580 (shared gateway storm, same cluster),
parent honesty `client-timeout-reconnect-honesty` (shipped 5.60.1),
parent recovery `client-timeout-reconnect-recovery` (shipped 5.60.2)

---

## 1. Problem Statement

**5.60.1** introduced `isRecoverableModbusError()`, which maps **every** `"Timed out"`
message through `FAILURE → failed → BREAK → broken → INIT → connectClient`.

The `reconnectOnTimeout` checkbox now has **no practical effect on application
timeouts**: with `reconnectOnTimeout=false` the `broken` handler routes to `INIT`
instead of `RECONNECT`, but `INIT` still calls `connectClient`. Both paths rebuild
the connection.

### Root cause trace (code)

```
modbusErrorHandling(err)
  └─ isRecoverableModbusError("Timed out")  → true
       └─ stateService.send('FAILURE')
            └─ failed handler  → BREAK
                 └─ broken handler
                      ├─ reconnectOnTimeout=true  → RECONNECT → reconnecting → init → connectClient
                      └─ reconnectOnTimeout=false → INIT        ─────────────────────→ connectClient  ← BUG
```

Both branches of `broken` eventually reach `init`, which schedules `connectClient`
(with a `reconnectTimeout` delay in the `false` branch since the previous state is
not `reconnecting`).

### Issue #580 relationship

One missing/slow PLC on a **shared gateway** generates repeated "Timed out" errors
that hit other unit IDs on the same TCP client, triggering continuous reconnect
storms (identical root cause). #586 semantics fix prevents the storm: without
reconnect, the slow PLC's timeout stays local to that command and does not perturb
the shared connection.

---

## 2. Goals

1. When `reconnectOnTimeout === false`, an **application "Timed out"** error MUST
   fail the command and unlock the queue without triggering any reconnect or
   `connectClient` call.
2. **Transport errors** (ECONNRESET, EHOSTUNREACH, closed serial, etc.) MUST still
   recover the connection regardless of `reconnectOnTimeout`.
3. When `reconnectOnTimeout === true`, all existing 5.60.1/5.60.2 behavior remains
   unchanged (FAILURE → full honesty/recovery cycle).
4. Ship as patch **5.60.3** on `support/v5.60`.

---

## 3. Scope

### In-scope

| Area | Change |
|------|--------|
| `src/core/modbus-client-core.js` | Add `isApplicationTimeoutError(err)` to distinguish app-level "Timed out" from transport errno errors |
| `src/modbus-client.js` — `modbusErrorHandling` | Gate `FAILURE` on `reconnectOnTimeout` when error is application timeout only |
| `test/units/modbus-client-core-test.js` | Boundary unit cases for `isApplicationTimeoutError` (AC-SEM-04) |
| `test/units/modbus-client-test.js` | New cases AC-SEM-01, -02, -03, -05 |
| `CHANGELOG.md` / `package.json` | **5.60.3** entry citing #586, #580 |

### Out-of-scope

- #577 Serial RTU ARM64 Node 24 segfault — separate capability
- Changing `reconnectOnTimeout` default (stays `true`)
- Modifying `modbusTcpErrorHandling` / `modbusSerialErrorHandling` (transport paths
  MUST NOT change)
- Any Fake-Ready or in-band `connectClient` from read/write (permanently blocked by
  FR-FSM-ACT and FR-FSM-CONN from honesty)
- Changing behavior when `reconnectOnTimeout === true`
- Altering the `broken` handler's existing routing logic (the `INIT`/`RECONNECT`
  branch remains correct for transport errors)

---

## 4. Functional Requirements

### FR-SEM-SPLIT — Distinguish application timeout from transport error

A new function `isApplicationTimeoutError(err)` MUST be added to
`src/core/modbus-client-core.js`.

It returns `true` when ALL of the following hold:
- `err` is non-null
- `err.message` is a string containing `"Timed out"`
- `err.errno` is absent or NOT in `coreClient.networkErrors`
- `err.code` is absent or NOT in `coreClient.networkErrors`

It returns `false` for all transport errno errors (ECONNRESET, ETIMEDOUT,
ESOCKETTIMEDOUT, EHOSTUNREACH, EAI_AGAIN, etc.) — those remain exclusively under
`isRecoverableModbusError`.

**Rationale:** the modbus-serial library issues a plain `Error('Timed out')` at the
application layer with no `errno` and no `code`. TCP/OS transport errors always
carry at least `errno` or `code`. The two sets are disjoint in the current library.
Adding the explicit guard ensures that a future library version that adds errno to
plain timeouts will NOT silently suppress the error (it would fall through to the
transport recovery path, which is the safer default).

### FR-SEM-SUPPRESS — Suppress FAILURE for application timeouts when checkbox false

`modbusErrorHandling` in `src/modbus-client.js` MUST apply the following guard
**before** calling `isRecoverableModbusError`:

```js
if (!node.reconnectOnTimeout && coreModbusClient.isApplicationTimeoutError(err)) {
  // queue already unlocked by queueSerialUnlockCommand above
  // cberr was already called by modbus-serial before the error event fires
  return  // do NOT send FAILURE; connection stays intact
}
```

This MUST NOT alter `modbusTcpErrorHandling` or `modbusSerialErrorHandling` — those
handle transport events that warrant reconnect regardless of the checkbox.

When `reconnectOnTimeout === true`, the guard is skipped and
`isRecoverableModbusError` path runs unchanged.

### FR-SEM-TRANSPORT-ALWAYS — Transport errors always recover

When `reconnectOnTimeout === false` and the error carries a transport errno/code
(values in `networkErrors`, or `"Port Not Open"`, or DNS `EAI_AGAIN`/`ENOTFOUND`),
`modbusErrorHandling` MUST send `FAILURE` as today, and the existing
`broken → INIT → connectClient` path MUST execute.

This preserves recovery for:
- Closed serial port
- TCP reset / peer closed
- Gateway disconnect
- DNS resolution failures

### FR-SEM-QUEUE-UNLOCK — Queue and serial unlock on suppressed timeout

When `FR-SEM-SUPPRESS` fires (application timeout, `reconnectOnTimeout=false`):
- `queueSerialUnlockCommand` MUST have been called (it is called unconditionally
  at the top of `modbusErrorHandling` — no new code required here).
- The FSM MUST remain in its current ready state so the next queued command may
  be dispatched (sequential drain re-arm continues unaffected — #574 watchpoint).

The timed-out command's `cberr` is delivered by modbus-serial before the client
`error` event is emitted. No additional `cberr` call is required inside
`modbusErrorHandling`.

### FR-SEM-NO-FAKE-READY — Honesty watchpoints unchanged

All watchpoints from `client-timeout-reconnect-honesty` MUST remain:
- **FR-FSM-ACT**: ACTIVATE from non-ready states still blocked.
- **FR-FSM-CONN**: in-band `connectClient` from read/write still forbidden.
- **FR-Q-WIPE**: INIT wipe `cberr` still fires when transport recovery runs.

---

## 5. Watchpoints (MUST NOT break)

| Watchpoint | Spec / Issue |
|------------|--------------|
| `reconnectOnTimeout=true` — timeout still drives FAILURE/reconnect | FR-TO-01 (honesty) |
| Transport errors with `reconnectOnTimeout=false` still recover | FR-SEM-TRANSPORT-ALWAYS |
| Sequential drain re-arm after command complete | #574 |
| Shared-client deregister isolation | #423 / #487 |
| No Fake-Ready via late ACTIVATE | FR-FSM-ACT (honesty) |
| No in-band `connectClient` from read/write | FR-FSM-CONN (honesty) |
| INIT wipe notifies pending with `cberr` | FR-Q-WIPE (honesty) |
| Single reconnect delay per cycle | FR-TMR-SINGLE (recovery) |
| Post-connect ACTIVATE reaches `activated` | FR-CONN-READY (recovery) |

---

## 6. Non-Goals (explicit)

- **No Fake-Ready**: the FSM does not gain new recovery paths via ACTIVATE from
  non-ready states. #586 only suppresses an unwanted FAILURE; it does not introduce
  a new "silent-ready" shortcut.
- **No in-band `connectClient`**: read/write/flex nodes never call `connectClient`
  directly to heal a timeout — that path was removed by honesty and stays removed.
- **No change to `isRecoverableModbusError`**: that function correctly maps transport
  errors; `isApplicationTimeoutError` is an additive sibling function.
- **No change to `broken` handler routing**: the `reconnectOnTimeout` branch in the
  `broken` handler (INIT vs RECONNECT) remains — it is correct for transport errors
  and is exercised when FR-SEM-TRANSPORT-ALWAYS fires.
- **No new palette options**: `reconnectOnTimeout` already exists; no UI changes needed.

---

## 7. Non-Functional

- Patch **5.60.3** on `support/v5.60` — backwards-compatible; no new palette options.
- No new runtime dependencies.
- Mocha + `node-red-node-test-helper` only.
- User-visible CHANGELOG entry citing #586 and #580.

---

## 8. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-SEM-01 | Unit: `modbusErrorHandling(new Error('Timed out'))` with `reconnectOnTimeout=false` → `stateService.send` is **never** called; FSM state unchanged |
| AC-SEM-02 | Unit: `modbusErrorHandling(new Error('Timed out'))` with `reconnectOnTimeout=true` → `stateService.send('FAILURE')` called exactly once |
| AC-SEM-03 | Unit: `modbusErrorHandling({ message: 'error', errno: 'ECONNRESET' })` with `reconnectOnTimeout=false` → `stateService.send('FAILURE')` called |
| AC-SEM-04 | Unit/core: `isApplicationTimeoutError` boundary table (see §10) — all rows pass |
| AC-SEM-05 | Unit: after suppressed timeout (`reconnectOnTimeout=false`), `serialSendingAllowed === true` (queue unlocked) and FSM remains in `activated` or `queueing` |
| AC-SEM-06 | Existing honesty AC-01 through AC-08 remain green (no regression on `reconnectOnTimeout=true` path) |
| AC-SEM-07 | Existing recovery AC-01 through AC-07 remain green |
| AC-SEM-08 | `npm run build` + targeted unit/e2e suite green; CHANGELOG **5.60.3** documents fix for #586 / #580 |

---

## 9. File Touch List

| File | Why |
|------|-----|
| `src/core/modbus-client-core.js` | Add `isApplicationTimeoutError` |
| `src/modbus-client.js` | Guard in `modbusErrorHandling` |
| `test/units/modbus-client-core-test.js` | Boundary unit cases for new predicate (AC-SEM-04) |
| `test/units/modbus-client-test.js` | AC-SEM-01, -02, -03, -05 |
| `CHANGELOG.md` | 5.60.3 Unreleased → Fixed |
| `package.json` | Version bump to 5.60.3 |
| `docs/p4nr/README.md` | Active capabilities table row |

**Files that MUST NOT be modified by Team 3 for this spec:**
- `src/modbus-read.js`, `src/modbus-write.js`, `src/modbus-flex-getter.js`
- `src/core/modbus-queue-core.js`
- Any HTML / locale files (no new user-facing options)

---

## 10. Test Strategy

### Unit tests — `test/units/modbus-client-core-test.js`

`isApplicationTimeoutError` boundary table:

| Input | Expected |
|-------|----------|
| `new Error('Timed out')` | `true` |
| `new Error('Port Timed out after 500ms')` | `true` (contains "Timed out") |
| `{ message: 'Timed out', errno: 'ETIMEDOUT' }` | `false` (errno in networkErrors) |
| `{ message: 'Timed out', code: 'ESOCKETTIMEDOUT' }` | `false` (code in networkErrors) |
| `{ message: 'error', errno: 'ECONNRESET' }` | `false` |
| `null` | `false` |
| `{}` | `false` |
| `{ message: '' }` | `false` |

### Unit tests — `test/units/modbus-client-test.js`

Use sinon stubs for `stateService` with a spy on `send`. Build node with test helper.

1. **AC-SEM-01 / AC-SEM-05** — `reconnectOnTimeout=false`, error `new Error('Timed out')`:
   - Assert `stateService.send` not called.
   - Assert `node.serialSendingAllowed === true`.
   - Assert FSM state === `'activated'` (or `'queueing'` depending on fixture).

2. **AC-SEM-02** — `reconnectOnTimeout=true`, same error:
   - Assert `stateService.send.calledOnceWith('FAILURE')`.

3. **AC-SEM-03** — `reconnectOnTimeout=false`, transport error `{ message: 'error', errno: 'ECONNRESET' }`:
   - Assert `stateService.send.calledWith('FAILURE')`.

### Build gate

`npm run build` MUST pass after every `src/` change (Babel + Gulp to `modbus/`).

---

## 11. Issue Mapping

| Issue | Role |
|-------|------|
| #586 | Primary — `reconnectOnTimeout=false` still rebuilds connection (P0 for 5.60.3) |
| #580 | Related — shared gateway reconnect storm (same root cause, same fix) |
| #569 | Parent recovery regression (watchpoint) |
| #564 | Grandparent honesty (watchpoint) |
| #574 | Queue drain regression guard |

---

## 12. Risks

| Risk | Mitigation |
|------|------------|
| Application "Timed out" with undocumented errno/code leaks through suppression | `isApplicationTimeoutError` explicitly gates on `err.errno` / `err.code` not in `networkErrors`; transport errors always recover |
| modbus-serial future version adds errno to plain timeout | Unit test asserts predicate against known modbus-serial error shapes; team must review on lib upgrade |
| Suppressed timeout leaves a half-open command slot if `cberr` not yet called | modbus-serial guarantees cberr before emitting client `error`; verify order in AC-SEM-01 test setup comment |
| #580 storm reduced but not fully eliminated if gateway sends TCP RST on unit-ID timeout | FR-SEM-TRANSPORT-ALWAYS ensures TCP RST still triggers FAILURE recovery — correct behavior |
