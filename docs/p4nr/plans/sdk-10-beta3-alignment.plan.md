# Implementation Plan: SDK 10.0.0-beta.3 Alignment

## Overview

Bringt die v6-Runtime in Einklang mit `@plus4nodered/node-modbus@10.0.0-beta.3`: Paket-Requires, TLS über `connectTCPSecure`, Entfernung interner Port-Hacks, Test-Mock-Update. Phase B verdrahtet Resilience in den FC-Pfad. Baut auf abgeschlossener `coverage-settings-upgrade` (610 passing) auf.

**Capability:** `docs/p4nr/capabilities/sdk-10-beta3-alignment.md`  
**Branch:** `upgrade_settings`  
**SDK-Referenz:** `node-modbus-serial` @ `v10.0.0-beta.3` (lokal: `../node-modbus-serial`)

## Prerequisites

- [ ] Team 2 Review → **APPROVE**
- [ ] GATE 1 — menschliche Freigabe (Phase A vs. A+B Scope)
- [ ] Baseline: `npm test` grün (610 passing / 10 pending)
- [ ] `npm install` mit Cloudsmith `.npmrcbeta` — SDK 10.0.0-beta.3 installiert

## GATE 1 Decisions (für Reviewer)

| # | Frage | Empfehlung |
|---|-------|------------|
| 1 | Scope GATE 1 | **Phase A only** — Team 3 startet A; Phase B nach separatem Mini-GATE oder selber APPROVE-Block |
| 2 | Integration FC-Test | **Erweitern** `tls-handshake.test.js` um FC3 statt neuer Datei |
| 3 | Connection Pool | Phase B: **eigenen Pool deprecate**, nicht in Connect-Pfad — UI-Flag bleibt no-op bis v6.2 |
| 4 | Telnet/C701 TLS | Phase A: **kein** `connectTCPSecure` — TLS nur `tcpType` default/TCP; andere Typen: TLS-Optionen ignorieren + `node.warn` einmalig |
| 5 | Commit-Kadenz | **Ein Commit pro grüner Phase** (A1, A2, …) |

## Phasen-Übersicht

| Phase | Fokus | Commits | Schätzung |
|-------|-------|---------|-----------|
| **A1** | Paket-Rename + Scripts | 1 | 0,5 d |
| **A2** | Connect Factory + TLS | 2 | 1,5 d |
| **A3** | Port-Ready / Event-Cleanup | 1 | 1 d |
| **A4** | Tests + Integration FC | 2 | 1,5 d |
| **B1** | Resilience wiring | 2 | 1,5 d |
| **B2** | Config aliases + cleanup | 1 | 0,5 d |

---

## task_list — Phase A

### Task A1.1: Paket-Require Migration

- **Files:**
  - `src/modbus-client.js`
  - `src/core/modbus-connection-pool.js`
  - `test/helper/modbus-test-helper.js`
  - `scripts/dependency-security-check.js`
  - `docs/MIGRATION-v6.md` (Abschnitt SDK-Paketname)
- **Action:** `@openp4nr/node-modbus` → `@plus4nodered/node-modbus`; README/Skill-Referenzen in `CLAUDE.md` falls vorhanden
- **Test:** `npm run lint`; Smoke `node -e "require('./src/modbus-client')"`
- **Risk:** Low

### Task A1.2: Mock-Helper SDK 10.x

- **Files:** `test/helper/modbus-test-helper.js`
- **Action:**
  - `require.resolve('@plus4nodered/node-modbus')`
  - Stub `connectTCPSecure` → gleiches Verhalten wie `connectTCP` + set `mockClient._tls = true`
  - Stub `sendCustomFc`, `readFileRecords` (no-op resolve) für spätere Tests
- **Test:** `test/e2e/modbus-fc-tls-matrix-e2e.test.js` — 12 passing
- **Risk:** Medium

---

### Task A2.1: TLS Connect Options Builder

- **Files:**
  - `src/core/client/modbus-tls-options.js`
  - `test/core/client/modbus-tls-options-test.js` (neu oder erweitern `modbus-client-security-test.js`)
- **Action:**
  - `buildTlsConnectOptions(config, credentials, tcpHost)` → `{ tls: { key, cert, ca, rejectUnauthorized, servername, … } }`
  - Bestehendes `buildTlsOptions` für Legacy-Flat-Merge deprecate (intern auf `buildTlsConnectOptions().tls` mappen)
- **Test:** RED — expects nested `tls` key; GREEN after impl
- **Risk:** Low

### Task A2.2: Connect Factory Modul

- **Files:**
  - `src/core/client/modbus-connect-factory.js` (**neu**)
  - `src/core/client/index.js` (export)
  - `test/core/client/modbus-connect-factory-test.js` (**neu**)
- **Action:**
  ```javascript
  connectModbusClient(node, client) // returns Promise
  // switch node.clienttype + node.tcpType + node.tlsEnabled
  // tlsEnabled + default TCP → client.connectTCPSecure(host, { port, tls, timeout })
  // else → existing connect* methods
  ```
- **Test:** Unit: plain TCP calls `connectTCP`; tls calls `connectTCPSecure` with `options.tls`
- **Risk:** Medium

### Task A2.3: modbus-client.js Refactor

- **Files:** `src/modbus-client.js`
- **Action:**
  - Ersetze inline switch (Zeilen ~294–380) durch `connectModbusClient(node, node.client)`
  - Entferne `Object.assign(*Options, node.tlsOptions)` auf Plain-TCP
  - Telnet/C701/TCP-RTU + `tlsEnabled`: log warn once, connect without TLS
- **Test:** E2E `modbus-client-connection-e2e.test.js`; TLS matrix E2E
- **Build:** `npm run build`
- **Risk:** High

---

### Task A3.1: Port Ready ohne `_port._client`

- **Files:**
  - `src/core/modbus-client-core.js`
  - `src/modbus-client.js` (close listener)
- **Action:**
  - Ersetze `_port._client.readable` Check durch `node.client && node.client.isOpen === true` + FSM state `activated`
  - Close-Handling: `client.on('close')` wenn SDK unterstützt; sonst FSM `onModbusClose` aus bestehendem Pfad
  - Entferne direktes `node.client._port.on('close', …)` wenn durch SDK-Event ersetzbar
- **Test:** `test/core/modbus-client-core-test.js` — existing tests green; grep `_port._client` = 0 in src
- **Risk:** High

### Task A3.2: Connection Pool isOpen Fix

- **Files:** `src/core/modbus-connection-pool.js`
- **Action:** Health check: `connection.client.isOpen === true` (Property, nicht Function)
- **Test:** `test/core/modbus-connection-pool-test.js` — existing pool tests
- **Risk:** Low

---

### Task A4.1: Integration TLS + FC3

- **Files:** `test/integration/tls-handshake.test.js`
- **Action:**
  - Nach Deploy: Client `actualServiceState = activated` (Test-Helper)
  - Trigger `modbus-read` poll oder inject; assert `msg.payload` Array length ≥ 1
  - Timeout 30s; kein `mockModbusSerial`
- **Test:** `npm run test:integration` — Handshake + FC3
- **Risk:** Medium

### Task A4.2: FC-Matrix & Issue-Docs Update

- **Files:**
  - `docs/p4nr/capabilities/fc-test-matrix.md`
  - `docs/p4nr/capabilities/v6-quality-hardening-issues.md` (SDK-Abschnitt)
- **Action:** TLS Integration-Spalte FC3 ✅; SDK-Alignment verlinken
- **Risk:** Low

### Task A4.3: Volllauf

- **Action:** `npm test` + `npm run test:integration`
- **Done when:** 0 failing; Commit message `feat(client): align modbus transport with SDK 10.0.0-beta.3 (Phase A)`

---

## task_list — Phase B (Resilience)

### Task B1.1: executeWithResilience im FC-Pfad

- **Files:** `src/core/modbus-client-core.js`
- **Action:**
  - Wrap SDK calls in `readModbusByFunctionCode*`, `writeModbusByFunctionCode*`, `customModbusMessage` mit `executeWithResilience(node, async () => …, { functionCode, address, … })`
  - Respektiere `node.circuitBreaker` / `node.retryHandler` nur wenn initialisiert (opt-in)
- **Test:** `test/core/modbus-client-resilience-test.js` (**neu**) — CB open → fast fail; retry → succeeds on 2nd
- **Risk:** High

### Task B1.2: Cleanup on Close

- **Files:** `src/modbus-client.js`, `src/core/modbus-client-core.js`
- **Action:** `cleanupResilienceModules(node)` in close/stop handler
- **Test:** Unit — spy cleanup called on node close
- **Risk:** Low

### Task B2.1: Config Alias Fix

- **Files:** `src/modbus-client.js`
- **Action:** `retryHandlerEnabled` aus Legacy-Config akzeptieren:
  ```javascript
  enableRetryHandler: config.retryEnabled === true || config.retryHandlerEnabled === true || config.enableRetryHandler === true
  ```
- **Test:** Unit preset/legacy config load
- **Risk:** Low

### Task B2.2: Connection Pool UI Honesty

- **Files:** `src/modbus-client.html` (Help-Text), `docs/MIGRATION-v6.md`
- **Action:** Hinweis „Connection pool not yet active in v6.0.x“ oder Flag in Runtime ignorieren mit debug log
- **Test:** none (docs)
- **Risk:** Low

---

## Verification Checklist (Team 3)

```bash
npm run build
npm test
npm run test:integration
rg '@openp4nr/node-modbus' src test scripts   # expect 0
rg '_port\._client' src                        # expect 0
```

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| TLS Integration flaky | Retries=1 in `.mocharc.integration.json`; dynamic port |
| Core export pollution (modbus-client-core-test) | bestehender `after()` restore beibehalten |
| serialport 12 vs 13 | Phase A: no bump; document in MIGRATION |
| Breaking SDK validation | `setStrictLengthValidation(false)` explizit nach connect (Phase B optional) |

## Handoff

```
HANDOFF → Team 2 (p4nr-spec-reviewer)
Artifacts:
- docs/p4nr/capabilities/sdk-10-beta3-alignment.md
- docs/p4nr/plans/sdk-10-beta3-alignment.plan.md
```
