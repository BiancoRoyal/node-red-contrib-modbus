# Spec Review: SDK 10.0.0-beta.3 Alignment

**Date:** 2026-07-12  
**Reviewer:** p4nr-spec-reviewer  
**Artifacts reviewed:**
- docs/p4nr/capabilities/sdk-10-beta3-alignment.md
- docs/p4nr/plans/sdk-10-beta3-alignment.plan.md

## Verdict

**APPROVE**

## GATE 1 Decisions (resolved for handoff)

| # | Question | Decision |
|---|----------|----------|
| 1 | Scope Team 3 Start | **Phase A only** (A1–A4); Phase B nach grünem A-Volllauf + kurzer Menschen-Freigabe |
| 2 | Integration FC-Test | **Erweitern** `test/integration/tls-handshake.test.js` um FC3 (keine separate Datei) |
| 3 | Connection Pool | **No-op + Help-Text** in Phase B2.2; kein SDK-Pool in v6.0.x |
| 4 | Telnet/C701 + TLS | **Warn + Plain connect** — kein `connectTCPSecure` für Nicht-Default-tcpType |
| 5 | Commit-Kadenz | **Ein Commit pro grüner Sub-Phase** (A1, A2, A3, A4, B1, B2) |

## Findings

| Severity | Area | Finding | Required action |
|----------|------|---------|-----------------|
| MEDIUM | Plan | Phase B Resilience wrap kann Timing/Reconnect-Verhalten ändern | Team 3: E2E Reconnect-Suite nach B1; Defaults bleiben CB/Retry **off** |
| MEDIUM | Spec | serialport v13 bewusst deferred | OK — in MIGRATION-v6.md bei A1 erwähnen |
| LOW | Plan | `modbus-connect-factory-test.js` neu — kein Jest-Parallel | OK — Mocha only |

## Blockers

None.

## Checklist Summary

- **A Completeness:** Actor, outcome, success signals, message contract, non-goals, open questions empty — pass
- **B Plan Quality:** Exact paths, phased RED/GREEN, build step, verification grep — pass
- **C Conventions:** Mocha, test-helper, server pkg external, locales only Phase B — pass
- **D Security:** Credentials, no PEM logs, TLS via `connectTCPSecure` — pass
- **E Test Strategy:** Unit + Integration + E2E Mock tier — pass

## Handoff to Team 3

**Entry point:** Task **A1.1** (Paket-Require) → **A1.2** (Mock) → **A2.1–A2.3** (TLS Factory)  
**Branch:** `upgrade_settings`  
**Approved scope:** Phase A (A1–A4); Phase B nur nach GATE 1 Bestätigung  
**Build rule:** `npm run build` after every `src/` change  
**Test gates:** `npm test` + `npm run test:integration` after A4  
**Commit cadence:** One commit per green sub-phase  

**Do not start:** FC20/43 Nodes, BLE, serialport@13, SDK SecurityManager — out of scope.

Start with:
1. Rename requires `@openp4nr` → `@plus4nodered/node-modbus`
2. Update `test/helper/modbus-test-helper.js` with `connectTCPSecure` mock
3. `src/core/client/modbus-connect-factory.js` + TLS nested options
4. Integration FC3 in `tls-handshake.test.js`
