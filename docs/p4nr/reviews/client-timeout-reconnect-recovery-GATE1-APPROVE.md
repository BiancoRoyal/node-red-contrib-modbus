# Review: client-timeout-reconnect-recovery — GATE 1

**Spec:** `docs/p4nr/capabilities/client-timeout-reconnect-recovery.md`  
**Plan:** `docs/p4nr/plans/client-timeout-reconnect-recovery.plan.md`  
**Date:** 2026-08-05  
**Reviewer:** p4nr-spec-reviewer (Team 2)

## Verdict: **APPROVE**

### Checklist

| Criterion | Result |
|-----------|--------|
| Field regression #569 on 5.60.1 tied to honesty side-effects (double delay, post-connect Ready) | Pass |
| Keeps FR-FSM-ACT / FR-FSM-CONN (no Fake-Ready, no in-band connect) | Pass |
| FR-TMR-SINGLE collapses only the *second* wait after `reconnecting`; FR-FSM-06 retries retained | Pass |
| FR-CONN-READY ACTIVATE only from `connected` via allow-list | Pass |
| Out-of-scope clear (#577, queue preserve, default timeout changes) | Pass |
| TDD-first plan with concrete ACs / files | Pass |
| Patch 5.60.2 backwards compatible; CHANGELOG required | Pass |
| No TLS / v6 scope creep | Pass |

### Notes / constraints for Team 3

1. Prefer `sendActivateIfAllowed(node)` on `connected` over ungated `send('ACTIVATE')`.
2. Use `actualServiceStateBefore.value === 'reconnecting'` (or equivalent) to skip the second init delay; do not remove the wait inside `reconnecting`.
3. E2E must assert recovery **without** `connectClient` nudge; existing nudge helper may remain for teardown grace only.
4. Do not re-open Fake-Ready (`ACTIVATE` from `broken`) even if it “fixed” 5.45.2 UX.

**GATE 1: APPROVE — Team 3 may implement in `src/` + `test/`.**
