# Plan: Client Timeout / Reconnect Honesty (#564 / #569)

**Spec:** `client-timeout-reconnect-honesty`  
**Date:** 2026-07-30  
**Target:** patch `5.60.1` on `support/v5.60`

## Steps (TDD)

1. **Failing tests first**
   - `test/units/modbus-client-test.js` (and/or core):
     - FR-TO-01: after active client, simulate `Timed out` via `modbusErrorHandling` /
       `activateSendingOnFailure` → expect BREAK/RECONNECT path when
       `reconnectOnTimeout=true` (fake timers).
     - FR-TO-02: `connectClient` / connect callback with `EAI_AGAIN` → reconnect
       scheduled; second success → connected/activated.
     - FR-FSM-ACT: force state `broken`, send `ACTIVATE` → state remains non-activated.
     - FR-FSM-CONN: stub `connectClient`; call read/write with half-open port flags →
       `connectClient` not called; failure/BREAK path taken.
     - FR-Q-WIPE: push buffered commands with `cberr` spies; force INIT/`initQueue`
       path → each `cberr` called once with clear error.
     - FR-TMR: assert reconnect timer ID cleared before reschedule; commandDelay
       timer cancelled on BREAK.
   - Keep all existing #574 re-arm / sequential drain tests green (AC-06).
   - Optional e2e: TCP server stop/start or DNS fail stub → Flex-Getter error +
     recovery without helper.reload.

2. **Implement FR-TO-01 / FR-TO-02** in `src/modbus-client.js` (+ core helpers):
   - Expand timeout/DNS recognition (message + `code` + `errno`).
   - Route into FAILURE/BREAK consistently with existing network errno path.
   - Ensure queue serial unlock + pending command failure.

3. **Implement FR-FSM-ACT** in `src/core/modbus-client-core.js`:
   - Remove or gate `ACTIVATE` from `broken` (and prevent activation from
     `reconnecting`/`init`/`failed` via gated send).
   - `activateSendingOnFailure` / `OnSuccess`: unlock/#574 re-arm always when
     applicable; `send('ACTIVATE')` only if current state allows ready drain.

4. **Implement FR-FSM-CONN** in `src/core/modbus-client-core.js`:
   - Remove in-band `connectClient()` from read/write half-open branches;
     fail into FSM recovery instead.

5. **Implement FR-Q-WIPE** in `src/core/modbus-queue-core.js` + call site in
   `src/modbus-client.js` init handler:
   - Before clearing maps, invoke each pending `cberr` (or wrapper).

6. **Implement FR-TMR** in `src/modbus-client.js`:
   - Fix `init` null-before-clear bug.
   - Store/clear `commandDelayTimeoutId` and `serialOpenTimeoutId`.

7. `npm run build`.

8. CHANGELOG under **5.60.1** citing #564 / #569; note wipe error behaviour.

9. Comment on GitHub #564 and #569 requesting field retest after publish.

## Files expected to change

| File | FRs |
|------|-----|
| `src/modbus-client.js` | TO-01/02, Q-WIPE, TMR |
| `src/core/modbus-client-core.js` | TO-*, FSM-ACT, FSM-CONN |
| `src/core/modbus-queue-core.js` | Q-WIPE |
| `src/modbus-basics.js` | optional status/reconnect align |
| `test/units/*`, `test/core/*`, maybe `test/e2e/*` | AC-01…07 |
| `CHANGELOG.md`, `package.json` version | 5.60.1 |

## Out of scope this PR

- #577 serial segfault ARM64 / Node 24.
- Dependabot bulk (#576).
- Chaos CI grace tuning.
- Queue preserve across outage (opt-in).
