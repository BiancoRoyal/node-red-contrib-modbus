# GATE 1 APPROVE — client-timeout-reconnect-semantics

**Capability:** `client-timeout-reconnect-semantics`
**Review:** `docs/p4nr/reviews/client-timeout-reconnect-semantics.review.md`
**Date:** 2026-10-20
**Reviewer:** p4nr-spec-reviewer (Team 2)
**Verdict:** **APPROVE**

---

## Authorization

Team 3 (`p4nr-developer`) is authorized to begin implementation.

Parent specs shipped:
- `client-timeout-reconnect-honesty` — 5.60.1 ✅
- `client-timeout-reconnect-recovery` — 5.60.2 ✅

---

## Implementation Constraints (Team 3 MUST follow)

1. **TDD order**: Write failing tests first (Steps 1 and 3 of plan), implement after.
2. **Files authorized to modify**:
   - `src/core/modbus-client-core.js` — add `isApplicationTimeoutError` only
   - `src/modbus-client.js` — add guard in `modbusErrorHandling` only
   - `test/units/modbus-client-core-test.js` — `isApplicationTimeoutError` boundary tests
   - `test/units/modbus-client-test.js` — `modbusErrorHandling` semantics tests
   - `CHANGELOG.md` — 5.60.3 Fixed entry
   - `package.json` — version bump to 5.60.3
   - `docs/p4nr/README.md` — active capabilities table row

3. **Files MUST NOT be modified**:
   - `src/modbus-read.js`, `src/modbus-write.js`, `src/modbus-flex-getter.js`
   - `src/core/modbus-queue-core.js`
   - `modbusTcpErrorHandling` / `modbusSerialErrorHandling` paths
   - `isRecoverableModbusError` (additive sibling only — do not alter)
   - `broken` handler routing (INIT vs RECONNECT stays unchanged)
   - Any HTML / locale files

4. **Build gate**: Run `npm run build` after every `src/` change.

5. **Regression gate (Step 5)**: All prior honesty AC-01..08 and recovery AC-01..07 MUST remain green before CHANGELOG.

6. **No Fake-Ready**: The suppress path MUST NOT add any new ACTIVATE transition or FSM state.

---

## Acceptance Criteria Summary

| AC | Must be green |
|----|---------------|
| AC-SEM-01 | `reconnectOnTimeout=false` + `Timed out` → `stateService.send` never called |
| AC-SEM-02 | `reconnectOnTimeout=true` + `Timed out` → `stateService.send('FAILURE')` called once |
| AC-SEM-03 | `reconnectOnTimeout=false` + ECONNRESET → `stateService.send('FAILURE')` called |
| AC-SEM-04 | `isApplicationTimeoutError` boundary table (8 cases) all pass |
| AC-SEM-05 | After suppressed timeout: `serialSendingAllowed === true`, FSM in `activated`/`queueing` |
| AC-SEM-06 | Honesty AC-01..08 green (no regression) |
| AC-SEM-07 | Recovery AC-01..07 green (no regression) |
| AC-SEM-08 | `npm run build` + full suite green; CHANGELOG 5.60.3 documents #586/#580 |

---

## Next Step

`p4nr-developer` (Team 3) → implement per `docs/p4nr/plans/client-timeout-reconnect-semantics.plan.md` → GATE 2.
