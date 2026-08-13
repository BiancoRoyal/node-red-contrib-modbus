# Plan: client-timeout-reconnect-recovery (5.60.2)

**Spec:** `docs/p4nr/capabilities/client-timeout-reconnect-recovery.md`  
**Target:** `support/v5.60` → **5.60.2**  
**Date:** 2026-08-05

## TDD order

1. **Unit / fake timers** (`test/units/modbus-client-test.js`)
   - AC-01: after `reconnecting` wait, `init` from reconnecting calls `connectClient` at delay 0 (spy `setTimeout` / stub `connectClient`).
   - AC-02: `CONNECT` → `connected` → state becomes `activated`.
   - AC-03: Fake-Ready still blocked (existing honesty test).
   - AC-04: half-open `readModbus` never calls `connectClient` (existing / extend).

2. **E2E** (`test/e2e/modbus-fsm-reconnect-e2e-test.js`)
   - AC-05: add (or adjust) recovery path that does **not** nudge `connectClient` in `init`.
   - Keep existing nudged path only if needed for CI grace; prefer no-nudge as primary assertion.

3. **Implement** in `src/modbus-client.js` (+ minimal status wiring)
   - FR-TMR-SINGLE in `init` handler.
   - FR-CONN-READY on `connected`.
   - `reconnectAttempt` counter reset on connect.

4. **Ship**
   - `npm run build`
   - CHANGELOG Unreleased → 5.60.2 notes; bump `package.json` to `5.60.2`
   - Update `docs/p4nr/README.md` capability table

## Files

| File | Action |
|------|--------|
| `src/modbus-client.js` | Delay + ACTIVATE + attempt counter |
| `src/modbus-basics.js` and/or `src/modbus-read.js` | Optional status “retrying (attempt N)” |
| `test/units/modbus-client-test.js` | New cases |
| `test/e2e/modbus-fsm-reconnect-e2e-test.js` | No-nudge recovery |
| `CHANGELOG.md`, `package.json` | 5.60.2 |
| `docs/p4nr/README.md` | Index row |

## Non-goals

- #577 serialport nesting
- Restoring Fake-Ready / in-band connect
