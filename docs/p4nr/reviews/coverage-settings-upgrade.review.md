# Spec Review: Comprehensive Coverage, TLS Assurance & Settings UX

**Date:** 2026-07-10  
**Reviewer:** p4nr-spec-reviewer  
**Artifacts reviewed:**
- docs/p4nr/capabilities/coverage-settings-upgrade.md
- docs/p4nr/plans/coverage-settings-upgrade.plan.md
- docs/p4nr/capabilities/fc-test-matrix.md

## Verdict

**APPROVE**

## GATE 1 Decisions (resolved for handoff)

| # | Question | Decision |
|---|----------|----------|
| 1 | Integration-Tier in CI | **Non-blocking** — Drone/nightly job; PR gate remains `npm test` |
| 2 | Server-TLS E2E in Client-Repo | **Yes** — via devDependency server package in `test/integration/` |
| 3 | Legacy Resilience merge | **Yes** — Advanced Tab in F5 (Task 5.3) |
| 4 | IO-Config Preview | **Phase 2** — minimal hints in F6.3 only |

## Findings

| Severity | Area | Finding | Required action |
|----------|------|---------|-----------------|
| MEDIUM | Spec | „Decisions“ section read as open questions | Resolved in table above — no Team 1 rework |
| MEDIUM | Plan | F5 Preset confirm-dialog UX underspecified | Team 3: confirm only when dirty fields exist |
| LOW | Plan | +80–120 new tests may exceed 10 min target | Accept; add `test:fast` in F7 if needed |

## Blockers

None.

## Checklist Summary

- **A Completeness:** Actor, outcome, success signals, message contract, non-goals — pass
- **B Plan Quality:** Concrete paths, phased tasks, RED/GREEN per task — pass
- **C Conventions:** Mocha, test-helper-extensions, locales, server pkg external — pass
- **D Security:** Credentials, no eval, TLS patterns, log hygiene — pass
- **E Test Strategy:** Two-tier pyramid, fc-test-matrix tracking — pass

## Handoff to Team 3

**Entry point:** Phase **F0** — Tasks F0.2 + F0.3 first  
**Branch:** `upgrade_settings`  
**Approved scope:** F0–F7 per plan; do not expand IO-Config Preview beyond F6.3  
**Commit cadence:** One commit per green phase (F0, F1, …)  
**Build rule:** `npm run build` after every `src/` change  
**Human GATE 2:** After each phase commit, present test counts

Start with:
1. `test/helper/tls-e2e-helper.js`
2. Extend `fc-e2e-helper.js` — `buildTlsServerClientFlow`
3. `.mocharc.integration.json` + `npm run test:integration`
4. Smoke test in `modbus-client-tls-e2e.test.js` (F0.2 acceptance)
