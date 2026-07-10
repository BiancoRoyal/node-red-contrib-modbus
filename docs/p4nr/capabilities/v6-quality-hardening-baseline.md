# v6 Quality Hardening — Test Baseline (Task 0)

**Date:** 2026-06-13  
**Branch:** current workspace  
**Node:** $(node -v) — recorded at run time  
**GATE 1:** approved 2026-06-13  

## Build

```bash
npm run build
```

**Result:** ✅ Success (gulp default ~4s)

## Full Test Suite

```bash
npm test   # includes npm run lint (prereq) + mocha test/**/*.js --recursive --exit
```

| Metrik | Wert |
|--------|------|
| **Passing** | 236 |
| **Pending (skipped)** | 65 |
| **Failing** | 1 |
| **Total executable** | 302 |
| **Duration** | ~7–9 s |

### Failure

| Test | File | Fehler |
|------|------|--------|
| should handle error during deregistration | `test/units/modbus-client-test.js` | Timeout 2000ms — `done()` nicht aufgerufen (bekannt: doppeltes `done()` in `deregisterForModbus`, Task 17) |

### Pending / Skipped (65)

Hauptquellen:

| Datei | Skip-Count | Grund (Kurz) |
|-------|------------|--------------|
| `test/core/modbus-connection-pool-test.js` | 15 | Pool nicht im Runtime-Pfad verdrahtet |
| `test/units/modbus-flex-getter-test.js` | 18 | Ready-to-Send / FSM-Hänger |
| `test/e2e/modbus-getter-e2e.test.js` | 11 | E2E ohne stabile Server-Fixtures |
| `test/e2e/modbus-flex-write-e2e.test.js` | 9 | E2E deferred |
| `test/units/modbus-flex-write-test.js` | 8 | FC-Write-Tests deferred |
| `test/units/modbus-flex-write-async.test.js` | 8 | Async-Write deferred |
| `test/units/modbus-getter-unit-test.js` | 9 | Getter-Unit deferred |
| `test/e2e/modbus-read-e2e.test.js` | 4 | E2E deferred |
| `test/e2e/modbus-write-e2e.test.js` | 4 | E2E deferred |
| `test/units/modbus-client-isolated.test.js` | 4 | FSM-Transition-Hänger |
| `test/units/modbus-robust-flow-test.js` | 4 | Flow-Integration deferred |
| `test/units/modbus-real-flow-test.js` | 4 | Real-Flow deferred |
| `test/e2e/modbus-client-tls-e2e.test.js` | 1 suite | Gesamte TLS-E2E skipped |
| `test/e2e/modbus-complete-e2e.test.js` | 1 suite | Complete E2E skipped |
| Diverse (connector, sequencer, io-config, …) | ~9 | Einzelne skips |

### Auskommentierte Tests (nicht in Pending-Zählung)

| Datei | Anzahl | v6-Aktion |
|-------|--------|-----------|
| `test/units/modbus-client-test.js` | ~5 | `update-for-v6` — active/queueing/ready-to-send |
| `test/core/modbus-client-core-test.js` | ~1 | `keep` |

## Test-Kategorisierung (v6 Plan)

Legende: `keep` | `update-for-v6` | `replace` | `remove`

### Client / FSM (Priorität 1)

| Datei | Kategorie | Begründung | Ziel-Task |
|-------|-----------|------------|-----------|
| `test/units/modbus-client-test.js` | update-for-v6 | Deregister-Timeout; auskommentierte active/queueing Tests | 4, 17, 16 |
| `test/units/modbus-client-isolated.test.js` | replace | 4× skip wegen FSM-Hänger → neue FSM-Tests | 2, 16 |
| `test/core/modbus-client-core-test.js` | update-for-v6 | FSM 16→12 Transition-Assertions | 2 |
| `test/core/modbus-fsm-transitions-test.js` | **neu** | 12-Zustands-Vertrag | 1, 2 |
| `test/core/client/modbus-fsm-handler-test.js` | **neu** | Handler-Unit-Tests | 3 |
| `test/units/modbus-client-reconnect-test.js` | **neu** | Intent-Reconnect | 5 |
| `test/units/modbus-client-ready-test.js` | **neu** | Nur `activated` sendet | 4, 11 |
| `test/e2e/modbus-client-tcp-error-test.js` | **neu** | #532 ECONNRESET | 13 |
| `test/e2e/modbus-client-tls-e2e.test.js` | update-for-v6 | skip entfernen nach TLS-Merge | 9 |
| `test/e2e/flows/modbus-client-e2e-connection-flows.js` | replace | Orphan-Flow → Runner anbinden | 16 |

### Flex / Ready-to-Send (Priorität 2)

| Datei | Kategorie | Begründung | Ziel-Task |
|-------|-----------|------------|-----------|
| `test/units/modbus-flex-getter-test.js` | update-for-v6 | 18× skip ready/not-ready | 11 |
| `test/units/modbus-flex-connector-test.js` | update-for-v6 | reconnecting/queueing ready skips | 5, 11 |
| `test/units/modbus-flex-sequencer-test.js` | update-for-v6 | inactive skip | 11 |

### Core / Queue (Priorität 2)

| Datei | Kategorie | Begründung | Ziel-Task |
|-------|-----------|------------|-----------|
| `test/core/modbus-queue-core-test.js` | update-for-v6 | Exception 11 + lazy queue | 6, 13 |
| `test/core/modbus-state-validator-test.js` | **neu** | 12 Zustände | 14 |
| `test/core/client/modbus-fc-executor-test.js` | **neu** | FC + Resilience | 7, 12 |
| `test/core/modbus-connection-pool-test.js` | keep (skip) | Opt-in Pool Task 12; skips bis verdrahtet | 12 |

### Read/Write/Buffer (#540)

| Datei | Kategorie | Ziel-Task |
|-------|-----------|-----------|
| `test/units/modbus-read-test.js` | update-for-v6 | 13 |
| `test/units/modbus-getter-unit-test.js` | update-for-v6 | 11, 13 |

### E2E deferred (Priorität 3 — nach Client-Core grün)

| Datei | Kategorie |
|-------|-----------|
| `test/e2e/modbus-read-e2e.test.js` | update-for-v6 |
| `test/e2e/modbus-write-e2e.test.js` | update-for-v6 |
| `test/e2e/modbus-getter-e2e.test.js` | update-for-v6 |
| `test/e2e/modbus-flex-write-e2e.test.js` | update-for-v6 |
| `test/e2e/modbus-complete-e2e.test.js` | update-for-v6 |

### Helper

| Datei | Kategorie | Ziel-Task |
|-------|-----------|-----------|
| `test/helper/modbus-test-helper.js` | update-for-v6 | Auto-ACTIVATE-Patch entfernen (opt-in only) | 16 |

## v6-Ziel nach Task 16

| Metrik | Baseline | Ziel |
|--------|----------|------|
| Passing | 236 | ≥ 280 (neue Tests minus entfernte skips) |
| Pending Client-FSM | ~9 | 0 |
| Failing | 1 | 0 |
| Client-Core Coverage | ~72% (Doku) | ≥ 85% |

## Referenzen

- Plan Task 0: `docs/p4nr/plans/v6-quality-hardening.plan.md`
- Issue-Matrix: `docs/p4nr/capabilities/v6-quality-hardening-issues.md`
- Migration: `docs/MIGRATION-v6.md`
