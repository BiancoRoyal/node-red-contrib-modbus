# Implementation Plan: v6 Quality Hardening

## Overview

v6 Major-Refactoring: Core-Aufspaltung, FSM-Vereinfachung (16→12 Zustände), bewusste Verhaltensverbesserungen und Test-Umstellung auf korrektes Verhalten. Kein Bug-for-bug-Compat zu v5.

Capability-Spec: `docs/p4nr/capabilities/v6-quality-hardening.md`

**Leitprinzip:** Tests definieren das gewünschte v6-Verhalten. Legacy-Tests die v5-Bugs absichern werden angepasst oder ersetzt — mit Begründung im Commit/CHANGELOG.

## Prerequisites

- [ ] Capability spec reviewed (Team 2 APPROVE)
- [ ] GATE 1 — menschliche Freigabe inkl. Breaking-Change-Liste
- [ ] `npm run build` baseline dokumentiert
- [ ] FSM 16→12 freigegeben (Decisions #2)
- [ ] Issue-Liste exportiert (Decisions #1 — vor Task 0)

## task_list

### Task 0: Baseline & Breaking-Change-Register ✅

- **Files:** `docs/MIGRATION-v6.md`, `docs/p4nr/capabilities/v6-quality-hardening-issues.md`, `docs/p4nr/capabilities/v6-quality-hardening-baseline.md`
- **Done:** 2026-06-13 — 236 pass / 65 pending / 1 fail; Issue-Matrix 150 Issues; Test-Kategorisierung

---

### Task 1: Core-Verzeichnisstruktur anlegen ✅

- **Files:** `src/core/client/*`, `src/core/queue/*`, `test/core/modbus-fsm-transitions-test.js`
- **Done:** 2026-06-13 — 10 Skelett-Module + 14 FSM-Transition-Tests (12 Zustände) grün

---

### Task 2: FSM extrahieren & vereinfachen (16→12) ✅

- **Done:** 2026-06-13 — 12-Zustands-FSM, SEND/ACTIVATE-Mapping, Transition-Tests grün

### Task 3: FSM-Handler extrahieren ✅

- **Done:** 2026-06-13 — `modbus-fsm-handler.js`, Unit- + Reconnect-Guard-Test

### Task 4: Post-Connect ACTIVATE + messageAllowedStates ✅

### Task 5: Reconnect Intent-Guard ✅

### Task 6: Queue lazy init + Serial-Lock ✅

### Task 7: FC-Executor extrahieren (~Re-Export) ✅

### Task 8: Connection-Factory (~Re-Export) ✅

### Task 11: Ready-to-Send in alle Client-Nodes ✅

### Task 13: Netzwerk-Fehler (#532) + Exception 11 (#536) + Buffer (#540) ✅

### Task 14: State Validator + Timer Manager ✅

### Task 16: Test-Suite v6 (93 pending E2E — Unit/Core grün)

### Task 17: Lifecycle-Fixes ✅

### Task 18: Dokumentation & Release-Artefakte (MIGRATION-v6.md ✅, CHANGELOG via release)

---

### Task 2: FSM extrahieren & vereinfachen (16→12)

- **Files:** `src/core/client/modbus-fsm.js`, `src/core/modbus-client-core.js` (delegiert)
- **Action:**
  - FSM aus `createStateMachineService()` extrahieren
  - Entfernen: `new` (initial=`init`), `reading`/`writing` (→ `sending`), `empty` (→ `activated`)
  - Events `READ`/`WRITE`/`EMPTY` mappen auf `SEND`/`ACTIVATE` in Handler
  - Kompatibilität: `startStateService()` API bleibt
- **Test:** `test/core/modbus-fsm-transitions-test.js` — 12 Zustände, alle Pfade
- **Risk:** High — zentral; alte Transition-Tests updaten

---

### Task 3: FSM-Handler extrahieren

- **Files:** `src/core/client/modbus-fsm-handler.js`, `src/modbus-client.js`
- **Action:** Subscribe-Logik (~258–426) → `createFsmHandler(node, deps)`; injizierte Deps für Testbarkeit
- **Test:** `test/core/client/modbus-fsm-handler-test.js` (neu, RED) — Mock-Node; Integration via `test/units/modbus-client-test.js`
- **Risk:** Medium

---

### Task 4: Post-Connect ACTIVATE + messageAllowedStates (Breaking)

- **Files:** `src/core/client/modbus-client-state.js`, `src/modbus-client.js`
- **Action:**
  - `connected`-Handler: `stateService.send('ACTIVATE')`
  - `messageAllowedStates = ['activated']` only
  - `isClientReadyToSend()` exportieren
- **Test:** `test/units/modbus-client-ready-test.js` — reject in `connected`, accept in `activated`
- **Risk:** High — Breaking; v5-Tests in Task 0 als `update-for-v6` markiert

---

### Task 5: Reconnect Intent-Guard (Breaking)

- **Files:** `src/core/client/modbus-fsm-handler.js`, `src/modbus-client.js`
- **Action:** `closeIntent: 'stop'|'switch'|'error'|'manual'`; `closed`→`RECONNECT` nur bei `error`/`timeout` + `reconnectOnTimeout`
- **Test:** `test/units/modbus-client-reconnect-test.js`
- **Risk:** Medium

---

### Task 6: Queue lazy init + Serial-Lock extrahieren

- **Files:** `src/core/queue/modbus-queue.js`, `src/core/queue/modbus-serial-lock.js`
- **Action:**
  - Lazy `Map` statt 256 pre-alloc Arrays
  - Serial-Lock aus Queue-Core trennen; TCP-Pfad ohne Lock-Overhead
  - `modbus-queue-core.js` → Re-Export-Wrapper (deprecation comment)
- **Test:** `test/core/modbus-queue-core-test.js` anpassen/erweitern
- **Risk:** Medium

---

### Task 7: FC-Executor extrahieren

- **Files:** `src/core/client/modbus-fc-executor.js`, `src/core/modbus-client-core.js`
- **Action:** FC 1–16 read/write aus 852-Zeilen-Monolith; `activateSendingOnSuccess/Failure` mit Exception-11-Handling
- **Test:** `test/core/client/modbus-fc-executor-test.js` (neu); bestehende Core-Tests grün
- **Risk:** Medium

---

### Task 8: Connection-Factory extrahieren

- **Files:** `src/core/client/modbus-connection.js`, `src/modbus-client.js`
- **Action:** `connectClient()`, TCP/Serial/TLS-Varianten, `@openp4nr/node-modbus` Factory
- **Test:** `test/units/modbus-client-test.js` — TCP + Serial laden
- **Risk:** Medium

---

### Task 9: TLS in modbus-client integrieren (Breaking)

- **Files:** `src/modbus-client.js`, `src/modbus-client.html`, `src/locales/`, `package.json`
- **Action:**
  - `clienttype: 'tcp-tls'` mit Credential-Store
  - `modbus-client-tls.js` / `.html` entfernen
  - Editor-Migration-Hinweis in Help-Text
  - `node-red.nodes` Eintrag TLS entfernen
- **Test:** `test/e2e/modbus-client-tls-e2e.test.js` — skip entfernen, gegen integrierten Client
- **Risk:** High — Breaking node type

---

### Task 10: modbus-client.js auf Wiring reduzieren

- **Files:** `src/modbus-client.js` (Ziel < 400 Zeilen)
- **Action:** Nur Node-RED-Lifecycle, Config, Registrierung, FSM/Connection-Wiring via Core-API
- **Test:** Volle Client-Test-Suite
- **Risk:** Medium

---

### Task 11: Ready-to-Send in alle Client-Nodes

- **Files:** `src/modbus-flex-getter.js`, `flex-write`, `flex-connector`, `flex-sequencer`, `modbus-getter.js`, `modbus-write.js`, `modbus-read.js`
- **Action:** `coreClient.isClientReadyToSend()` vor Enqueue; `suppressNotReadyWarnings` Config-Option
- **Test:** `test/units/modbus-client-ready-test.js` — je Node
- **Risk:** Low

---

### Task 12: Resilience verdrahten (opt-in)

- **Files:** `src/core/resilience/` (verschieben), `src/core/client/modbus-fc-executor.js`, `src/modbus-client.html`
- **Action:**
  - Module nach `src/core/resilience/` verschieben
  - `executeWithResilience()` in FC-Executor; Config `circuitBreakerEnabled`, `retryEnabled` (default false)
  - Ungenutzte Init-Pfade entfernen
- **Test:** `test/core/resilience/circuit-breaker-test.js` (verschieben); FC-Executor mit Retry-Mock
- **Risk:** Medium

---

### Task 13: Netzwerk-Fehler (#532) + Exception 11 (#536) + Buffer (#540)

- **Files:** `src/core/client/modbus-connection.js`, `modbus-fc-executor.js`, `src/core/modbus-core.js`, Read/Getter-Nodes
- **Action:** Safe error classification; Exception 11 queue clear; `cloneBufferForNodeRED()`
- **Test:** `test/e2e/modbus-client-tcp-error-test.js`, Queue-Test, Read FC3-Test
- **Risk:** High

---

### Task 14: State Validator + Timer Manager

- **Files:** `src/core/modbus-state-validator.js`, `src/core/modbus-timer-manager.js`, FSM-Handler
- **Action:** Validator für 12 Zustände; alle FSM-Timer via TimerManager
- **Test:** `test/core/modbus-state-validator-test.js`, Timer-Tests
- **Risk:** Low

---

### Task 15: Legacy-Namespace entfernen

- **Files:** `src/core/modbus-client-core.js`, `modbus-queue-core.js`, `modbus-basics.js`, alle `de.biancoroyal.*` Referenzen
- **Action:**
  - Facade-Wrapper mit Deprecation-Warnung (1 Minor) → dann entfernen
  - Alles über `src/core/client/index.js` und `src/core/queue/index.js`
- **Test:** Grep-Check: 0 Treffer `de.biancoroyal.modbus` in `src/`
- **Risk:** Medium

---

### Task 16: Test-Suite auf v6-Verhalten umstellen

- **Files:** `test/units/modbus-client-test.js`, `modbus-client-isolated.test.js`, `test/helper/modbus-test-helper.js`, skipped Tests
- **Action:**
  - Auto-ACTIVATE-Patch entfernen
  - Skipped Tests reaktivieren mit v6-Erwartungen
  - Orphan-Flow `modbus-client-e2e-connection-flows.js` anbinden
  - Kategorie `update-for-v6` aus Task 0 abarbeiten
- **Test:** `npm test` — 0 skip für Client-FSM; Coverage ≥ 85 % Client-Core
- **Risk:** Medium

---

### Task 17: Lifecycle-Fixes

- **Files:** `src/modbus-client.js` (`deregisterForModbus`, Timer-Cancel)
- **Action:** Einmaliges `done()`; Timer bei STOP/Deregister canceln
- **Test:** `test/units/modbus-client-test.js` — Register/Deregister-Zyklus ohne doppeltes `done()`
- **Risk:** Low

---

### Task 18: Dokumentation & Release-Artefakte

- **Files:** `docs/MIGRATION-v6.md`, `docs/architecture/ARCHITECTURE.md`, `CHANGELOG.md`, `CLAUDE.md`
- **Action:** FSM-Diagramm (12 Zustände), Modul-Map, Breaking Changes, Issue-Matrix final
- **Test:** `npm run build && npm test && npm run coverage`
- **Risk:** Low

---

## Empfohlene Reihenfolge

```
Task 0 (Baseline + MIGRATION-v6.md)
  → Task 1 (Struktur)
  → Task 2–3 (FSM extract + simplify + handler)
  → Task 4–5 (ACTIVATE + Reconnect — Breaking)
  → Task 6–8 (Queue + FC + Connection)
  → Task 9–10 (TLS merge + slim client node)
  → Task 11–14 (Ready-to-Send + Resilience + Issues + Validator)
  → Task 15 (Legacy namespace)
  → Task 16–17 (Tests + Lifecycle)
  → Task 18 (Docs)
```

Nach jeder Task-Gruppe: `npm run build && npm test` — GATE 2.

## Erfolgskriterien (Definition of Done)

| Kriterium | Messung |
|-----------|---------|
| Architektur | Core-Module ≤ 300 Zeilen; `src/core/client/` + `queue/` |
| FSM | 12 Zustände, Transition-Tests 100 % |
| Breaking Changes | `MIGRATION-v6.md` vollständig |
| Send-Gate | Nur `activated`; Ready-Tests grün |
| TLS | Ein Node-Typ; E2E grün |
| Issues | #532, #536, #540 behoben + getestet |
| Legacy | 0× `de.biancoroyal.modbus` in src |
| Coverage | Client-Core ≥ 85 % |
| Qualität | Kein uncaught ECONNRESET; kein FSM-Hänger in Tests |
