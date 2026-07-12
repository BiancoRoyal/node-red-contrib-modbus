# Capability: SDK 10.0.0-beta.3 Alignment (Client & FC Services)

## Summary

**Wer:** P4NR Team 1 → Team 2 Review → Team 3 Implementierung  
**Branch:** `upgrade_settings` (Fortsetzung nach `coverage-settings-upgrade`)  
**Was:** Runtime-Alignment von `@plus4nodered/node-red-contrib-modbus` v6 auf **`@plus4nodered/node-modbus@10.0.0-beta.3`** — korrekte Paket-Requires, TLS via `connectTCPSecure`, Entfernung fragiler `_port`-Zugriffe, Resilience-Wiring im FC-Pfad, Test-/Mock-Update.  
**Erfolgssignal:**

- **0 Treffer** `require('@openp4nr/node-modbus')` in `src/`, `test/`, `scripts/`
- **TLS produktionsfähig:** `tlsEnabled` nutzt `connectTCPSecure(host, { port, tls })`; Integration-Test mit echtem Handshake **und FC3**
- **Resilience wirksam:** `circuitBreakerEnabled` / `retryEnabled` beeinflussen Read/Write/Custom-FC (nachweisbar per Unit + E2E)
- **`npm test`:** ≥610 passing, 0 failing (Baseline nach `coverage-settings-upgrade`)
- **`npm run test:integration`:** TLS Handshake + FC-Lauf grün (nicht nur Deploy-Smoke)
- **Keine `_port._client`-Zugriffe** in `src/` (öffentliche SDK-API / FSM-Events)

## Beziehung zu anderen Capabilities

| Capability | Status | Beziehung |
|------------|--------|-----------|
| `v6-quality-hardening` | APPROVE | FSM, Ready-to-Send, Exception-11 — unverändert |
| `coverage-settings-upgrade` | APPROVE, F0–F7 umgesetzt | Test-Pyramide + Presets — **Basis** für SDK-Upgrade-Tests |
| **Diese Capability** | neu | Runtime ↔ SDK 10.x — **blockiert** sinnvolle Nutzung von beta.3 |

## Problemstellung

### Paket-Mismatch (P0)

| Ist | Soll |
|-----|------|
| `package.json`: `@plus4nodered/node-modbus@10.0.0-beta.3` | ✅ |
| `src/modbus-client.js:45`: `require('@openp4nr/node-modbus')` | `@plus4nodered/node-modbus` |
| Tests/Mocks: `@openp4nr/node-modbus` | gleiches Paket |

Ohne Fix: Runtime bricht nach frischem `npm install` (kein Alias).

### TLS-Connect (P0)

SDK 10.x (`apis/connection.js`):

- `connectTCPSecure(ip, options)` **erfordert** `options.tls` (sonst `Promise.reject`)
- Flaches `Object.assign(tcpOptions, tlsOptions)` auf `connectTCP` ist **nicht** Modbus Security Protocol-konform

Contrib (`src/modbus-client.js:310–374`): merge TLS in TCP/Telnet/C701/TCP-RTU-Buffered — **falsch für beta.3**.

### Resilience tot (P0 UX/Trust)

- `executeWithResilience` in `src/core/modbus-client-core.js:250–318` — **0 Aufrufer** in `src/`
- Advanced-Tab (`circuitBreakerEnabled`, `retryEnabled`) täuscht Schutz vor
- Legacy `modbus-client-tls.html`: `retryHandlerEnabled` vs. Runtime `retryEnabled` — Mapping fehlt

### Fragile Interna (P1)

- `node.client._port.on('close', …)` — `modbus-client.js`
- `node.client._port._client.readable` — `modbus-client-core.js:509`
- Eigener `ModbusConnectionPool` prüft `isOpen` als Function — SDK: Property-Getter

### SDK-Features ungenutzt (Phase B/C — Non-Goals hier teilweise)

FC17/20/22/23/24/43, Enron, BLE, Worker — **explizit Phase C** (separate Capability oder v6.1).

## Zielbild

### Architektur nach Phase A

```
modbus-client.js
  └── connectModbusTransport(node)     ← neu: src/core/client/modbus-connect-factory.js
        ├── connectTCP (plain)
        ├── connectTCPSecure (tlsEnabled)
        ├── connectTelnet / UDP / C701 / TcpRTUBuffered
        └── connectRTU* / connectAsciiSerial

modbus-client-core.js
  └── readModbus / writeModbus / customModbusMessage
        └── executeWithResilience(node, () => sdkCall, options)   ← wired
```

### SDK-Nutzungs-Matrix (Scope Phase A)

| SDK-API | Phase A | Phase B (Plan, nicht diese Spec-GATE) |
|---------|---------|----------------------------------------|
| `@plus4nodered/node-modbus` require | ✅ | — |
| `connectTCPSecure` + `options.tls` | ✅ | — |
| `connectTCP` / Serial / UDP / … | ✅ refactor only | — |
| `readCoils` … `writeRegisters` | ✅ unchanged paths | — |
| `sendCustomFc` | ✅ unchanged | — |
| `executeWithResilience` wiring | — | ✅ Phase B |
| `setStrictLengthValidation` | — | ✅ Editor Advanced |
| FC20/43 Nodes | — | Phase C Capability |

## Node-RED Surface

### Geänderte Runtime-Dateien (Phase A)

| Datei | Änderung |
|-------|----------|
| `src/modbus-client.js` | Paket-Require; Connect über Factory; kein `_port.on` |
| `src/core/client/modbus-connect-factory.js` | **neu** — Transport-Auswahl inkl. TLS |
| `src/core/client/modbus-tls-options.js` | Export `buildTlsConnectOptions()` → `{ tls: { … } }` für SDK |
| `src/core/modbus-client-core.js` | `isClientPortReady()` statt `_port._client`; optional B: Resilience wrap |
| `src/core/modbus-connection-pool.js` | Require-Pfad; `isOpen` Property-Check |
| `src/locales/*` | nur bei neuen Editor-Strings (Phase B) |

### Config (unverändert in Phase A)

Bestehende Presets/Advanced-Tab aus `coverage-settings-upgrade` bleiben; Phase A ändert **Runtime-Verhalten**, nicht Editor-Layout.

## Message Contract

**Keine Breaking Changes** an `msg.payload` / FC-Feldern in Phase A.

| Verhalten | Vorher | Nachher |
|-----------|--------|---------|
| TLS-Flow | Mock/E2E teils grün, Produktion fragil | Echter `connectTCPSecure` |
| Fehler bei TLS ohne `options.tls` | Undocumented / silent fail | Klare SDK-Fehlermeldung → `node.error` / FSM `BREAK` |
| Resilience (Phase B) | Kein Effekt | Retry/CB vor Fehler-Propagation (opt-in) |

## Constraints

- **Credentials:** weiterhin Node-RED Credential Store; `buildTlsOptions` loggt **keine** PEM-Bodies (`getTlsOptionsLogKeys`)
- **Backwards compatibility:** Flow-JSON unverändert; `modbus-client-tls` Deprecation-Banner bleibt
- **Server:** `@plus4nodered/node-red-contrib-modbus-server` — nur in `test/integration/`
- **Build:** `npm run build` nach jeder `src/`-Änderung
- **Tests:** Mocha + `test-helper-extensions.js`; kein Jest für Node-Tests
- **serialport:** Phase A **kein** Bump auf v13 (separates Risiko-Ticket); dokumentieren in Plan

## Test Strategy

### Phase A — Pflicht

| Tier | Datei | Inhalt |
|------|-------|--------|
| Unit | `test/core/client/modbus-connect-factory-test.js` | TCP vs TLS routing, `options.tls` shape |
| Unit | `test/core/client/modbus-tls-options-test.js` | erweitern: `buildTlsConnectOptions` |
| Unit | `test/core/modbus-client-core-test.js` | Port-ready ohne `_port._client` |
| Integration | `test/integration/tls-handshake.test.js` | **erweitern:** FC3 Read nach Handshake |
| Integration | `test/integration/tls-fc-read.test.js` | **neu** optional wenn Handshake-Datei zu groß |
| E2E Mock | `test/e2e/modbus-fc-tls-matrix-e2e.test.js` | grün nach Mock-Update |
| Helper | `test/helper/modbus-test-helper.js` | Mock `@plus4nodered/node-modbus`, `connectTCPSecure` |

### Regression-Issues (Phase A Abdeckung)

| Issue | Test-Anker |
|-------|------------|
| [#569](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/569) Timeout core | Connect-Factory Timeout-Weitergabe |
| [#564](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/564) Comm failure | TLS error → FSM, kein Crash |
| Open TLS E2E | Integration FC3 |

### Phase B — (Plan, GATE 1 optional getrennt)

- `executeWithResilience` in read/write/custom paths
- `cleanupResilienceModules` on close
- `retryHandlerEnabled` Alias fix
- Connection-Pool: **entfernen oder SDK-Pool** — Entscheidung in Plan Task B.4

## Non-Goals (Phase A)

- Neue FC-Nodes (FC20, FC43, Enron) — Phase C / separate Capability
- BLE (`connectBle`), Worker API, SDK SecurityManager FC-Whitelist
- `serialport@13` Migration
- RS-485 Half-Duplex (#547)
- Dynamische IP pro Message (#563) — separate Capability
- Entfernung `modbus-client-tls` Node-Typ aus `package.json`

## Success Metrics

| Metrik | Ziel |
|--------|------|
| `npm test` | 0 failing |
| `npm run test:integration` | Handshake + min. 1 FC grün |
| grep `@openp4nr/node-modbus` in src/test | 0 |
| grep `_port\._client` in src | 0 |
| FC-Matrix TLS-Spalte Client/Connection | Deploy + FC3 ✅ |

## Open Questions

*(Leer — GATE-1-Entscheidungen im Plan dokumentiert.)*
