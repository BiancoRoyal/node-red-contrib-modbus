# Capability: v6 Quality Hardening

## Summary

**Wer:** P4NR Team 3 (Developer), gesteuert durch Team 1/2 Spec-Pipeline  
**Was:** v6 Major-Release (`@plus4nodered/node-red-contrib-modbus` 6.x) — Clean-Code-Refactoring, Core-Aufspaltung und **bewusste Verhaltensverbesserungen** gegenüber v5 OSS. Ziel: die zuverlässigste, sicherste und wartbarste Modbus-Contribution für Node-RED.  
**Erfolgssignal:**

- `npm run build && npm test` grün — Tests beschreiben **korrektes** v6-Verhalten, nicht v5-Bugs
- Client-FSM deterministisch: Connect → `activated` → Queue → Send → Reconnect-Zyklus ohne Hänger
- Core in fokussierte Module (< 300 Zeilen/Datei) ohne Legacy-Namespace `de.biancoroyal.modbus.*`
- Dokumentierte GitHub-Issues behoben; stale Issues triagiert (Fix | Won't Fix | Test)
- Modbus-Spec + Kommunikationssicherheit (TLS, Fehlerklassifikation, Input-Validierung) eingehalten
- `docs/MIGRATION-v6.md` für Breaking Changes; CHANGELOG v6.0.0

## v6 Breaking-Change-Policy

v6 ist ein **Major Version Upgrade** — Refactoring und Verhaltensänderungen sind explizit erlaubt, wenn sie Korrektheit, Sicherheit oder Wartbarkeit verbessern.

| Prinzip | v5 OSS | v6 closed |
|---------|--------|-----------|
| Verhalten | Bug-for-bug compatible | **Spec-korrekt** — Tests als Vertrag |
| API-Oberfläche | Stabil | Node-Typen bleiben; Semantik darf sich ändern |
| Legacy-Code | Beibehalten | Entfernen/ersetzen mit Migration Guide |
| Module | Monolithen | Aufspaltung nach Single Responsibility |
| FSM | 16 Zustände, undokumentierte Abkürzungen | Vereinfacht + explizite Invarianten |

**Nicht breaking:** Node-RED-Palette-Namen (`modbus-client`, `modbus-read`, …) und grundlegende Message-Shape (`msg.payload`, `msg.topic`, FC-Felder).

**Breaking (dokumentiert in MIGRATION-v6.md):**

1. `messageAllowedStates` enthält **`activated` only** (nicht mehr `connected`) — Nachrichten vor `mbactive` werden abgelehnt mit `node.warn`
2. `closed` → Reconnect nur bei `reconnectOnTimeout` und ohne explizites Stop/Switch — kein Auto-Reconnect bei manuellem Close
3. `modbus-client-tls` Node **entfällt** — TLS über `modbus-client` mit `clienttype: tcp-tls`
4. Not-ready Input: einheitlich `node.warn` (Default); optional `suppressNotReadyWarnings` — kein stilles Enqueue in kaputten Zuständen
5. Resilience (Circuit Breaker, Retry) **aktiv** im Read/Write-Pfad wenn konfiguriert — oder Module entfernt (kein halber Zustand)
6. Legacy-Namespace-APIs intern — externe Direkt-Requires auf `de.biancoroyal.*` unsupported

## Hintergrund / Problemstellung

Über 10 Jahre OSS-Pflege mit begrenzter Zeit:

| Bereich | Symptom | v6-Ziel |
|---------|---------|---------|
| FSM-Orchestrierung | Monolithischer Subscribe-Handler (~170 Zeilen) | `modbus-fsm-handler.js` + Unit-Tests |
| Post-Connect | Kein `ACTIVATE`; `connected` als Send-State | Immer `connected → activated` |
| Reconnect | `closed` sendet immer `RECONNECT` | Intent-basiert (`stop`/`switch`/`error`) |
| `modbus-client-core.js` | 852 Zeilen, FSM+FC+Settings+Resilience | 5–7 fokussierte Module |
| `modbus-client.js` | 1001 Zeilen | Node-Wiring < 400 Zeilen |
| Legacy-Namespace | `de.biancoroyal.modbus.*` | ES2019 Classes + `module.exports` |
| Resilience | Initialisiert, nie verdrahtet | Verdrahten oder entfernen |
| TLS-Client | Separater Node ohne FSM | In `modbus-client` integriert |
| Tests | Skipped, Auto-ACTIVATE-Patch | Verhaltenstests ohne Workarounds |

Referenz: `docs/development/IMPROVEMENT_PLAN.md`, `docs/TODO.md`, `test/TEST_CRASH_FIX_GUIDE.md`.

## Zielarchitektur (Core-Aufspaltung)

```
src/core/
├── client/
│   ├── modbus-fsm.js              # XState-Machine (16→12 Zustände, s.u.)
│   ├── modbus-fsm-handler.js      # Subscribe-Side-Effects
│   ├── modbus-connection.js       # TCP/Serial/TLS Connect-Factory
│   ├── modbus-fc-executor.js      # FC 1–16 read/write (aus client-core)
│   ├── modbus-client-state.js     # Ready-to-Send, Unit-ID, Events
│   └── index.js                   # Public Core-API für Nodes
├── queue/
│   ├── modbus-queue.js            # Per-Unit Queue (lazy init, nicht 256 pre-alloc)
│   └── modbus-serial-lock.js      # Serial-Gating (TCP-neutral benannt)
├── resilience/                    # Optional aktivierbar pro Client
│   ├── circuit-breaker.js
│   ├── retry-handler.js
│   └── connection-pool.js
├── modbus-core.js                 # Buffer, FC-Mapping (bestehend, bereinigt)
├── modbus-io-core.js
├── modbus-state-validator.js
├── modbus-timer-manager.js
└── modbus-logger.js
```

### FSM-Vereinfachung (v6)

Ziel: weniger Zustände, gleiche Semantik nach außen (`mb*` Events).

| v5 Zustand | v6 | Begründung |
|------------|-----|------------|
| `reading` / `writing` | → `sending` | Nur Non-Buffer-Serial; TCP immer buffered |
| `empty` | → `activated` | Queue-leer ist Subzustand von activated |
| `new` | → `init` (initial) | Redundant |
| `switch` | bleibt | Dynamic Reconnect |
| Rest | unverändert | `init`, `opened`, `connected`, `activated`, `queueing`, `sending`, `closed`, `reconnecting`, `failed`, `broken`, `stopped` |

**Ergebnis: 12 Zustände.** Migration: interne Events gleich; globale `mb*` Events unverändert.

## Node-RED Surface

| Node-Typ | Datei | v6-Änderung |
|----------|-------|-------------|
| `modbus-client` | `src/modbus-client.js` | TLS integriert; schlankes Wiring |
| ~~`modbus-client-tls`~~ | entfernt | Migration → `modbus-client` + TLS-Config |
| Read/Write/Getter/Flex-* | `src/modbus-*.js` | `isClientReadyToSend()` via Core |
| `modbus-queue-info` | `src/modbus-queue-info.js` | Lazy-Queue-Metriken |

Server: `@plus4nodered/node-red-contrib-modbus-server` (separates Repo).

## Message Contract

### Global Events (`emitGlobalStateChange`) — stabil

| Event | Semantik |
|-------|----------|
| `mbinit` | Verbindungsaufbau |
| `mbconnected` | Transport up |
| `mbactive` | **Einziger Send-fähiger Zustand** (Breaking) |
| `mbqueue` | Dequeue aktiv |
| `mbopen` | Serial geöffnet |
| `mbclosed` | Geschlossen |
| `mbreconnecting` | Reconnect-Timer |
| `mberror` / `mbbroken` | Fehler |
| `mbswitch` | Dynamic Reconnect |

### Ready-to-Send (v6 Standard)

```javascript
// src/core/client/modbus-client-state.js
isClientReadyToSend(clientNode) → boolean
// true iff state === 'activated' && !clientNode.isInactive()
```

Bei `false`: `node.warn('Modbus client not ready')` — Default. Kein Enqueue.

### Error Paths

| Fehlerklasse | FSM | Ausgabe |
|--------------|-----|---------|
| ECONNRESET, ETIMEDOUT, … | `FAILURE` → Reconnect-Pfad | `node.warn`, kein Crash (#532) |
| Exception 11 | Queue clear + `ACTIVATE` | `node.warn` (#536) |
| Ungültige Unit-ID/Address | — | `node.error`, reject |
| Shared Buffer NR 4.1+ | Deep-Clone | Korrekte Werte (#540) |

## Constraints

### Qualitäts-Invarianten (v6)

1. Post-Connect: `CONNECT` → `ACTIVATE` innerhalb eines Event-Ticks
2. Reconnect nur bei Intent `error`/`timeout`, nicht bei `stop`/`switch`/`manual`
3. Kein FSM-Zustand > 30 s in `queueing`/`sending` ohne Recovery
4. Alle FSM-Timer über `ModbusTimerManager`
5. Core-Dateien ≤ 300 Zeilen (Ausnahme: FC-Executor mit FC-Tabelle)
6. Kein `de.biancoroyal.modbus.*` in neuem Code

### Modbus-Spec & Security

- Unit-ID: TCP 0–255, Serial 0–247
- FC 1–16; Exception-Codes in `msg.modbusCode`
- TLS: Credentials only; `tlsRejectUnauthorized: true` default
- Input-Validierung vor Bus-Zugriff
- Kein Process-Terminate durch Netzwerkfehler

### Resilience (v6 Default)

Circuit Breaker + Retry Handler **verdrahten** in `modbus-fc-executor.js` — Client-Config:
- `circuitBreakerEnabled` (default: `false` — opt-in)
- `retryEnabled` (default: `false`)
- Connection Pool: default `false`, nur TCP

Ungenutzte Resilience-Code-Pfade ohne Config-Flag → entfernen.

## Test Strategy

Tests sind **Verhaltensvertrag für v6**, nicht Schutzschicht für v5-Bugs.

### Baseline Task 0

Protokollieren, dann Tests schrittweise auf v6-Semantik umstellen (erwartetes Verhalten ändern, nicht Code anpassen um alte Bugs zu behalten).

### Neue Tests

| Datei | Zweck |
|-------|-------|
| `test/core/modbus-fsm-transitions-test.js` | 12-Zustands-Graph |
| `test/core/client/modbus-fc-executor-test.js` | FC + Resilience |
| `test/units/modbus-client-reconnect-test.js` | Intent-basierter Reconnect |
| `test/units/modbus-client-ready-test.js` | Nur `activated` sendet |
| `test/e2e/modbus-client-tcp-error-test.js` | #532 |
| `test/e2e/modbus-client-v6-migration-test.js` | Breaking-Change-Szenarien |

### Issue-Matrix

| Issue | v6-Aktion |
|-------|-----------|
| #532 | Fix + E2E |
| #536 | Fix + Queue-Test |
| #540 | Buffer-Clone |
| Ready To Send | Einheitlich alle Nodes |
| FSM-Hänger | FSM-Tests + Timer |

## Non-Goals

- SunSpec (#340), Crawler, neue Features
- Server-Package in diesem Repo
- v5 OSS Backport
- Jest für Node-RED-Node-Tests
- Editor-UI-Redesign (nur TLS-Migration-Hinweis)
- Performance-Benchmarks

## Decisions (GATE 1 — 2026-06-13)

| # | Thema | Entscheidung |
|---|-------|--------------|
| 1 | GitHub-Issue-Export | Maintainer exportiert vor Task 0; Matrix in `docs/p4nr/capabilities/v6-quality-hardening-issues.md` |
| 2 | FSM 16→12 | **Freigegeben** — `reading`/`writing`/`empty`/`new` entfallen |
| 3 | Lazy Queue | **Freigegeben** — lazy `Map`, rein intern |
| 4 | Resilience | **Opt-in, default `false`** für Circuit Breaker und Retry |
| 5 | Node.js | **Nur 18+** (`engines` in package.json) |
