# Review: client-timeout-reconnect-honesty — GATE 1

**Spec:** `docs/p4nr/capabilities/client-timeout-reconnect-honesty.md`  
**Plan:** `docs/p4nr/plans/client-timeout-reconnect-honesty.plan.md`  
**Date:** 2026-07-30  
**Reviewer:** p4nr-spec-reviewer (Team 2)

## Verdict: **APPROVE**

### Checklist

| Criterion | Result |
|-----------|--------|
| Field root cause tied to #564/#569 (Timed out, EAI_AGAIN, silent waiting) | Pass |
| FRs cover timeout, DNS, Fake-Ready ACTIVATE, in-band connect, wipe notify, timers | Pass |
| Watchpoints: FR-FSM-06 retries, #574 re-arm, maxQueueDepth, shared-client | Pass |
| Out-of-scope clear (#577, chaos CI, queue preserve, Dependabot) | Pass |
| Patch 5.60.1 backwards compatible; CHANGELOG required | Pass |
| TDD-first plan with concrete files/ACs | Pass |
| No TLS / v6 scope creep | Pass |
| OSS stability | Pass |

### Notes / constraints for Team 3

1. Prefer **gating** `send('ACTIVATE')` on ready states over removing too many FSM edges if that preserves #574 drain; if FSM table changes, add unit coverage for sequential re-arm.
2. Do **not** collapse intentional double delay (reconnecting → init) in this patch unless tests prove a single delay; FR-TMR is clear-before-reschedule first.
3. Wipe error message MUST be stable and documented in CHANGELOG (flows may Catch it).
4. Sibling draft `serial-rtu-arm64-node24` remains DRAFT — no `src/` work for #577 here.

**GATE 1: APPROVE — Team 3 may implement in `src/` + `test/`.**
