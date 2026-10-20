# Review: client-timeout-reconnect-semantics

**Spec:** `docs/p4nr/capabilities/client-timeout-reconnect-semantics.md`
**Plan:** `docs/p4nr/plans/client-timeout-reconnect-semantics.plan.md`
**Date:** 2026-10-20
**Reviewer:** p4nr-spec-reviewer (Team 2)
**Target:** 5.60.3 on `support/v5.60`
**GitHub:** #586 (P0), #580

See **GATE 1 APPROVE:** `client-timeout-reconnect-semantics-GATE1-APPROVE.md`.

---

## Verdict

**APPROVE**

---

## Checklist

| Item | Status | Notes |
|------|--------|-------|
| Backwards compatibility (`reconnectOnTimeout=true` default unchanged) | ✅ PASS | Guard is gated on `!node.reconnectOnTimeout` — default path is identical to 5.60.2 |
| CHANGELOG impact noted | ✅ PASS | 5.60.3 Fixed entry in Step 6 cites #586 and #580 |
| Server node impact considered | ✅ PASS | `Modbus-Server` untouched; only `modbus-client.js` + `modbus-client-core.js` |
| No accidental v6-only scope (TLS, server split, winston) | ✅ PASS | No TLS, no server split, no winston — uses `debug` throughout |
| Mocha + test-helper paths concrete | ✅ PASS | Specific files + sinon spy patterns shown in plan Steps 1 and 3 |
| Open Questions empty | ✅ PASS | Neither spec nor plan contains unresolved open questions |

---

## Findings

| ID | Severity | Area | Finding |
|----|----------|------|---------|
| F-01 | INFO | Core | `isApplicationTimeoutError` does not yet exist in `src/core/modbus-client-core.js` — correct; additive function to be implemented in Step 2 |
| F-02 | INFO | Client | `modbusErrorHandling` currently has no `reconnectOnTimeout` guard (line 520–531) — confirmed root cause of #586; plan Step 4 addresses this exactly |
| F-03 | INFO | FSM | `broken` handler (line 303–307) already branches `reconnectOnTimeout` → RECONNECT / INIT; spec correctly leaves this untouched (transport error path) |
| F-04 | INFO | Queue | `queueSerialUnlockCommand` is called unconditionally as first line of `modbusErrorHandling`; FR-SEM-QUEUE-UNLOCK requires no new code — verified |
| F-05 | INFO | Predicate | `isApplicationTimeoutError` gates on `err.errno` / `err.code` not in `networkErrors`; array is complete for known modbus-serial library shapes — safe |

No blockers. All findings are informational confirmations.

---

## Spec Quality

**Problem statement**: Root-cause trace through `modbusErrorHandling → isRecoverableModbusError → FAILURE → broken → INIT → connectClient` is accurate and directly verifiable in the current code at `src/modbus-client.js` line 528 and `src/core/modbus-client-core.js` line 61.

**FR-SEM-SPLIT**: Predicate logic sound. modbus-serial emits `Error('Timed out')` with no `errno`/`code`; TCP/OS transport errors always carry at least one. The two sets are disjoint given the current library version.

**FR-SEM-SUPPRESS**: Guard placement — after `queueSerialUnlockCommand`, before `isRecoverableModbusError` — is correct and minimal. No double-unlock risk.

**FR-SEM-TRANSPORT-ALWAYS**: Explicitly preserved; no risk of suppressing ECONNRESET, closed serial, DNS errors with `reconnectOnTimeout=false`.

**FR-SEM-NO-FAKE-READY**: The suppress path does not introduce any new FSM state or ACTIVATE transition. FSM stays in its current ready state (activated/queueing). No Fake-Ready regression possible.

**Watchpoints (§5)**: All 9 watchpoints are traced to prior shipped capabilities (honesty 5.60.1, recovery 5.60.2, #574, #423/#487). Regression coverage is explicit.

**Acceptance criteria (§8)**: 8 ACs, all verifiable with sinon stubs + test-helper. AC-SEM-06/07 explicitly re-run all prior ACs from honesty and recovery.

## Plan Quality

**TDD order**: Failing tests first (Steps 1 and 3), implementation second (Steps 2 and 4). Correct per OSS rules.

**Code snippets**:
- `isApplicationTimeoutError` (Step 2) matches FR-SEM-SPLIT exactly.
- `modbusErrorHandling` guard (Step 4) matches FR-SEM-SUPPRESS exactly; preserves all existing logging before the guard.

**`npm run build` gates**: Correctly placed after each `src/` change (Steps 2, 4, 7).

**Regression step (Step 5)**: Runs honesty + recovery unit/e2e suites before CHANGELOG bump. Commands are concrete.

**Non-goals explicit**: Do NOT modify `modbusTcpErrorHandling`, `modbusSerialErrorHandling`, `isRecoverableModbusError`, HTML, or `broken` handler routing. Clear and safe.

---

## Security Assessment

No security concerns. The guard:
- Does NOT introduce new FSM paths or states.
- Does NOT bypass transport error recovery (transport errors always reach `FAILURE`).
- Does NOT create a "silent-ready" shortcut (Fake-Ready watchpoint upheld).
- Cannot be triggered by crafted external payloads — error is raised by modbus-serial internally before the client `error` event fires.

---

## Handoff to Team 3

See `client-timeout-reconnect-semantics-GATE1-APPROVE.md` for Team 3 handoff instructions.
