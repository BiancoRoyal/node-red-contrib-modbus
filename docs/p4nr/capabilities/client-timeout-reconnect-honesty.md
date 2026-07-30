# Capability Spec: Client Timeout / Reconnect Honesty (#564 / #569)

**Spec ID:** `client-timeout-reconnect-honesty`  
**Version:** v5 OSS LTS (`node-red-contrib-modbus` 5.x)  
**Status:** READY FOR REVIEW  
**Author:** p4nr-spec-author (Team 1)  
**Date:** 2026-07-30  
**Related:** GitHub #564 (silent stall), #569 (Timed out / stuck reconnect), #553 (silent death cluster), #409 (queue wipe on timeout)

---

## 1. Problem Statement

Releases **5.46.0–5.60.0** claimed FSM/queue hardening for silent stalls and
timeout recovery. Field feedback on **5.50.0 and 5.60.0** (issue #564, reporter
demod-au, 2026-07-30) shows the opposite for common failure modes:

- After a WiFi/DNS blip, Flex-Getter stays on **waiting**.
- Logs show `Error: Timed out` and `getaddrinfo EAI_AGAIN` on hostname clients.
- Recovery requires Node-RED restart or switching the client to a raw IP.
- Disable/enable of Flex-Getter alone is no longer enough.

[#574](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/574)
(Queue full / sequential drain) was fixed in **5.50.1** and MUST NOT regress.

### Root causes (code)

| # | Cause | Location |
|---|-------|----------|
| 1 | `modbusErrorHandling` only reacts to `err.errno` in `networkErrors` — plain `"Timed out"` stays in `sending`/`activated` with no BREAK | `src/modbus-client.js` |
| 2 | `activateSendingOnFailure` always sends `ACTIVATE`; FSM allows `broken → activated` (Fake-Ready without socket) | `src/core/modbus-client-core.js` FSM + activate helpers |
| 3 | Read/Write call in-band `connectClient()` on half-dead TCP — races the FSM reconnect path | `src/core/modbus-client-core.js` |
| 4 | DNS errors (`EAI_AGAIN`, `ENOTFOUND`) not consistently mapped into the reconnect cycle | connect + error paths |
| 5 | Every `INIT` calls `initQueue` and drops pending work **without** `cberr` | `src/modbus-client.js` + `modbus-queue-core.js` |
| 6 | Orphan `commandDelay` / serial-open timers after BREAK/INIT | `src/modbus-client.js` |
| 7 | `init` handler sets `reconnectTimeoutId = 0` **before** `clearTimeout` | `src/modbus-client.js` |

---

## 2. Goals

1. Make `reconnectOnTimeout=true` (default) honestly recover from application
   timeouts and DNS/network errors without requiring deploy/restart.
2. Eliminate Fake-Ready (`activated` without a live transport) after late
   completion callbacks.
3. Propagate INIT queue wipe as defined errors to pending producers.
4. Ship as patch **5.60.1** on `support/v5.60` with Mocha regressions that
   encode the field scenarios (#564 / #569).

---

## 3. Scope

### In-scope

| Area | Change |
|------|--------|
| `src/modbus-client.js` | Timeout/DNS → BREAK/FAILURE; timer store/clear; INIT wipe notify; commandDelay/serialOpen cancel |
| `src/core/modbus-client-core.js` | Gate ACTIVATE; remove/disable in-band `connectClient` from read/write; expand network error recognition |
| `src/core/modbus-queue-core.js` | Fail-pending helper on wipe (or called from client) |
| `src/modbus-basics.js` | Align timeout / Port Not Open status with reconnect emission where needed |
| `test/` | Unit + e2e/integration regressions for timeout, DNS, late ACTIVATE, wipe-cberr |
| CHANGELOG | 5.60.1 bugfix entry citing #564 / #569 |

### Out-of-scope

- Serial segfault on ARM64 Node 24 ([#577](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/577)) — separate capability
- Opt-in queue preserve across outage (keep wipe; only add `cberr`)
- CI chaos suite timeout tuning
- Dependabot bulk / serialport major beyond what 5.60.0 already shipped
- Removing `maxQueueDepth` or changing #574 sequential re-arm semantics

---

## 4. Functional Requirements

### FR-TO-01 — Timeout drives reconnect

When `reconnectOnTimeout === true` and a Modbus operation fails with an
application or transport timeout (`err.message === 'Timed out'` or
`err.code` / `err.errno` in `{ ETIMEDOUT, ESOCKETTIMEDOUT }` or equivalent),
the client MUST:

1. Unlock serial sending if locked.
2. Deliver the failure to the pending command callback (`cberr`).
3. Enter the documented recovery path (`FAILURE` → `failed` → `BREAK` →
   `broken` → `RECONNECT` → … → `INIT` → `connectClient`), same family as
   existing network errno handling.

When `reconnectOnTimeout === false`, timeout MUST still unlock and fail the
command; it MUST NOT silently leave the FSM forever in `sending` as if healthy.
(Existing FR-FSM-03: `broken` → `INIT` once without `RECONNECT` remains.)

### FR-TO-02 — DNS / network errors same path

Connect and runtime errors with codes including at least
`EAI_AGAIN`, `ENOTFOUND`, `ECONNREFUSED`, `ECONNRESET`, `ENETUNREACH`,
`EHOSTUNREACH`, plus existing `networkErrors` entries, MUST use the same
recovery family as FR-TO-01 (FAILURE/BREAK → reconnect when enabled).

Hostname clients (mDNS / `.local`) MUST recover after transient DNS failure
without requiring a config flip to IP (field #564).

### FR-FSM-ACT — No Fake-Ready via late ACTIVATE

`ACTIVATE` MUST NOT transition the machine into `activated` from
`broken`, `reconnecting`, `init`, or `failed`.

Completion helpers (`activateSendingOnSuccess` / `OnFailure`) MAY still unlock
queue slots (`sendingAllowed`, serial unlock, #574 re-arm) when safe, but MUST
NOT send a state-changing `ACTIVATE` while the client is in a non-ready
recovery state. Preferred approaches (pick one in implementation, document in
CHANGELOG if FSM table changes):

- Remove `ACTIVATE` transition from those states in the XState machine, **or**
- Gate `stateService.send('ACTIVATE')` on `messageAllowedStates` / ready states.

### FR-FSM-CONN — No in-band connectClient from Read/Write

`readModbus` / `writeModbus` MUST NOT call `node.connectClient()` to “heal”
`!readable` / `!writable` sockets. Half-open detection MUST trigger the FSM
recovery path (`BREAK`/`FAILURE`/`reconnect` event) instead of a parallel
socket open.

### FR-Q-WIPE — INIT wipe notifies pending

When `initQueue` clears buffered commands, every pending entry that still has
a callback MUST receive a defined error (e.g.
`Error: Modbus queue cleared on reconnect` or similar stable message) via
`cberr` before the buffers are emptied. Silent drop is forbidden.

Downstream nodes with `emptyMsgOnFail` continue to behave per existing option
semantics once `cberr` fires.

### FR-TMR — Timer honesty

All of the following MUST store timeout IDs on the node, `clearTimeout` the
previous ID **before** zeroing the field, and only then schedule a new timer:

- `reconnectTimeoutId` (init + reconnecting handlers)
- `commandDelay` dequeue timer (sending handler)
- serial open delay timer (`setSerialConnectionOptions` / `openSerialClient`)

Orphan timers after BREAK/INIT/STOP MUST be cancelled.

---

## 5. Watchpoints (MUST NOT break)

| Watchpoint | Spec / Issue |
|------------|--------------|
| Sequential reconnect retries while `reconnectOnTimeout=true` | FR-FSM-06 (`repo-quality-and-fsm-hardening`) |
| Sequential drain re-arm after command complete | #574 / `queue-sequential-drain-rearm` |
| `maxQueueDepth` retained | FR-QUEUE-01 |
| Shared-client partial deregister does not STOP others | #423 / #487 |

---

## 6. Non-Functional

- Patch release **5.60.1** — backwards compatible public API / palette options.
- No new runtime dependencies.
- Mocha + `node-red-node-test-helper` only for node tests.
- User-visible CHANGELOG entry citing #564 and #569.

---

## 7. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | Unit (fake timers): `Timed out` with `reconnectOnTimeout=true` reaches `reconnecting`/`init` and schedules `connectClient`; never stays forever in `sending` as ready |
| AC-02 | Unit: inject `EAI_AGAIN` on connect → reconnect loop; success on next connect restores `activated`/`connected` path |
| AC-03 | Unit: late `ACTIVATE` while `broken`/`reconnecting` does not yield `activated` |
| AC-04 | Unit/core: INIT wipe invokes `cberr` for each pending buffered command |
| AC-05 | Unit: Read/Write paths never call `connectClient` (spy) on half-open port; they fail into FSM recovery |
| AC-06 | Existing #574 re-arm / sequential drain tests remain green |
| AC-07 | E2E or integration: TCP drop or DNS-fail simulation → Flex-Getter error (or emptyMsg) and client returns to active without deploy |
| AC-08 | `npm run build` + targeted unit/core/e2e suite green; CHANGELOG 5.60.1 documents fix |

---

## 8. Issue mapping

| Issue | Role |
|-------|------|
| #564 | Primary field regression (5.50/5.60) |
| #569 | Timeout / stuck Initialized↔Reconnecting |
| #553 | Silent death cluster (same recovery honesty) |
| #409 | Queue wipe without notify (FR-Q-WIPE) |
| #574 | Regression guard (must stay fixed) |
| #577 | Out of scope — follow-up `serial-rtu-arm64-node24` |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| More aggressive BREAK on timeout increases reconnect churn | Only when `reconnectOnTimeout=true`; document; keep commandDelay / reconnectTimeout |
| Gating ACTIVATE breaks #574 drain | Unlock + re-arm without illegal ACTIVATE; when in ready states still ACTIVATE as today |
| Wipe `cberr` surprises flows that relied on silent drop | Stable error message; emptyMsgOnFail still works; CHANGELOG notes behaviour |
| Double reconnect delay (reconnecting + init) | FR-TMR fixes leaks; do not remove intentional sequential delays (FR-FSM-06) in this patch unless tests prove single delay is safer — prefer timer honesty first |
