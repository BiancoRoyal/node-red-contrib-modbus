# Implementation Plan: Comprehensive Coverage, TLS & Settings UX

## Overview

Erweitert Test-Abdeckung (FC-Matrix × Transport × Node-Varianten), führt TLS-Sicherheitstests ein und macht Settings/Config-Templates nutzbar. Baut auf `fc-e2e-helper.js`, `mocha-global-setup.js` und v6-Client-Core auf.

**Capability:** `docs/p4nr/capabilities/coverage-settings-upgrade.md`  
**Branch:** `upgrade_settings`  
**Abhängigkeit:** `v6-quality-hardening` APPROVE (bestehend)

## Prerequisites

- [ ] Team 2 Review → **APPROVE** für diese Capability
- [ ] GATE 1 — menschliche Freigabe (Test-Matrix-Umfang + Preset-Verhalten)
- [ ] Baseline: `npm test` grün (Stand: ~548 pass / 13 pending)
- [ ] `test/certificates/` gültig (`generate-certs.sh`)

## Phasen-Übersicht

| Phase | Fokus | Commits (Ziel) | Dauer (Schätzung) |
|-------|-------|----------------|-------------------|
| **F0** | Infrastruktur & Matrix-Dok | 1 | 0,5 d |
| **F1** | Core/Unit TLS + FC-Executor | 2–3 | 2 d |
| **F2** | E2E FC-Matrix Plain TCP (Lücken) | 2–3 | 2 d |
| **F3** | E2E FC-Matrix TLS (Mock-Tier) | 2–3 | 2 d |
| **F4** | Integration TLS (echter Handshake) | 1–2 | 1,5 d |
| **F5** | Settings UX + Client-Presets | 2–3 | 2 d |
| **F6** | I/O-Node Options + i18n | 1–2 | 1 d |
| **F7** | Skips schließen + CI-Scripts | 1 | 1 d |

---

## task_list

### F0 — Test-Infrastruktur & Matrix

#### Task F0.1: FC-Test-Matrix dokumentieren

- **Files:** `docs/p4nr/capabilities/fc-test-matrix.md` (neu)
- **Action:** Tabelle Node × FC × TCP × TLS × Status (✅/🔲/⏭)
- **Done when:** Alle 14 Palette-I/O-Nodes erfasst

#### Task F0.2: TLS Test-Harness

- **Files:**
  - `test/helper/tls-e2e-helper.js` (neu)
  - `test/helper/fc-e2e-helper.js` (erweitern: `buildTlsServerClientFlow`, `tlsEnabled`)
- **Action:**
  - Wiederverwendung `test/certificates/*`
  - `buildServerClientFlow({ tls: true })` → Client `tlsEnabled: true`, Server aus Server-Paket oder Mock
  - Option `useRealTls: false` (Default) für Mock-Tier
- **Test:** Smoke in `test/e2e/modbus-client-tls-e2e.test.js` — ein FC5 über TLS-Mock-Flow
- **Risk:** Low

#### Task F0.3: npm Scripts Integration-Tier

- **Files:** `package.json`, `.mocharc.integration.json` (neu)
- **Action:**
  ```json
  "test:integration": "mocha --config .mocharc.integration.json --exit"
  ```
  - Spec: `test/integration/**/*.test.js` only
  - Kein `mockModbusSerial` in Integration-Hooks
- **Risk:** Low

---

### F1 — Core/Unit: TLS & FC

#### Task F1.1: TLS Options Builder Tests

- **Files:**
  - `test/core/client/modbus-connection-tls-test.js` (neu)
  - `src/modbus-client.js` (extract `buildTlsOptions(config, credentials)` wenn nötig)
- **Action:** Tests für:
  - Credentials → `tlsOptions`
  - Env `MODBUS_TLS_*`
  - Legacy-Felder (`privateKey`, `rejectUnauthorized`)
  - Kein PEM in Log (spy auf winston)
- **Test:** RED → GREEN, `npm run test:core`
- **Risk:** Medium

#### Task F1.2: FC-Executor Unit-Tests

- **Files:** `test/core/client/modbus-fc-executor-test.js` (neu, geplant in v6 Task 7)
- **Action:** FC1–16 Happy-Path + Invalid FC + Quantity-Bounds
- **Risk:** Medium

#### Task F1.3: Security Unit-Tests

- **Files:** `test/core/modbus-client-security-test.js` (neu)
- **Action:** `rejectUnauthorized`, `checkServerIdentity` callback, malformed cert strings
- **Risk:** Low

---

### F2 — E2E Plain TCP (Lücken schließen)

#### Task F2.1: Flex-Getter E2E FC1–4

- **Files:** `test/e2e/modbus-flex-getter-e2e.test.js` (neu)
- **Pattern:** `fc-e2e-helper.js`, analog `modbus-getter-e2e.test.js`
- **Tests:** FC1–4, error, keepMsgProperties

#### Task F2.2: Flex-FC E2E — Skips aktivieren

- **Files:** `test/e2e/modbus-fc-flex-e2e-test.js`
- **Action:** 2 pending Tests reparieren (error path, client undefined) mit `waitForTestNode`
- **Tests:** + Custom FC aus `extras/argumentMaps/defaults/codes.json` (1 Stichprobe)

#### Task F2.3: Flex-Sequencer + Connector E2E

- **Files:**
  - `test/e2e/modbus-flex-sequencer-e2e-test.js` (skip entfernen)
  - `test/e2e/modbus-flex-connector-e2e.test.js` (TLS-agnostic erweitern)
- **Tests:** je 2 Happy-Path + 1 Error-Path

#### Task F2.4: Orphan Flow anbinden

- **Files:**
  - `test/e2e/modbus-client-connection-e2e.test.js` (neu)
  - `test/e2e/flows/modbus-client-e2e-connection-flows.js`
- **Tests:** Connect → activated → Read FC3

#### Task F2.5: Queue-Info + Response-Filter E2E

- **Files:** `test/e2e/modbus-queue-info-e2e.test.js`, `test/e2e/modbus-response-filter-e2e.test.js` (neu)
- **Tests:** Queue-Metriken nach Read; Filter mit IO-Config

**F2 Done when:** FC-Matrix Plain-Spalte ≥ 90 % ✅

---

### F3 — E2E TLS (Mock-Tier)

#### Task F3.1: TLS Client mit `tlsEnabled` (nicht Legacy-Alias)

- **Files:** `test/e2e/flows/modbus-tls-e2e-flows.js` (Migration)
- **Action:** Flows auf `modbus-client` + `tlsEnabled: true` umstellen; Legacy `tcpType: 'TLS'` entfernen
- **Tests:** Deploy + `buildTlsOptions` stub verification

#### Task F3.2: TLS FC-Matrix — Read/Write

- **Files:**
  - `test/e2e/modbus-read-tls-e2e.test.js` (neu)
  - `test/e2e/modbus-write-tls-e2e.test.js` (neu)
- **Tests:** FC1–4 Read, FC5/6/15/16 Write mit TLS-Mock-Client

#### Task F3.3: TLS FC-Matrix — Getter/Flex

- **Files:**
  - `test/e2e/modbus-getter-tls-e2e.test.js` (neu)
  - `test/e2e/modbus-flex-write-tls-e2e.test.js` (neu)
  - `test/e2e/modbus-flex-getter-tls-e2e.test.js` (neu)
- **Tests:** je FC-Stichprobe + error/emptyMsgOnFail

#### Task F3.4: TLS Client E2E erweitern

- **Files:** `test/e2e/modbus-client-tls-e2e.test.js`
- **Action:** Bestehende Registrierungs-Tests behalten; **neue** Suite `TLS FC Operations` mit echten FC-Assertions via `tls-e2e-helper`
- **Tests:** Env-Vars, Credential-Store (RED credentials mock)

**F3 Done when:** FC-Matrix TLS-Spalte (Mock) ≥ 80 % ✅

---

### F4 — Integration TLS (echter Handshake)

#### Task F4.1: TLS Handshake Integration Test

- **Files:** `test/integration/tls-handshake.test.js` (neu)
- **Action:**
  - Start `modbus-server-tls` auf dynamischem Port (`test-port-helper`)
  - `modbus-client` mit `tlsEnabled`, PEMs aus `test/certificates/`
  - Read FC3 Holding Register — assert payload
- **Timeout:** 60s; `npm run test:integration` only
- **Risk:** High (flaky) — retries=1, feste Wartezeiten nach deploy

#### Task F4.2: Negative TLS Tests (Integration)

- **Files:** `test/integration/tls-security.test.js` (neu)
- **Tests:**
  - Wrong CA → connection fails
  - Expired cert (optional fixture)
  - `rejectUnauthorized: true` + self-signed → fail

#### Task F4.3: Docker-optional Marker

- **Files:** `test/integration/modbus-tls-docker.test.js` (neu, optional)
- **Action:** Skip wenn `MODBUS_TLS_DOCKER!=1`; nutzt `example/modbus-tls-docker/`
- **Risk:** Low (opt-in)

---

### F5 — Settings UX: Client-Presets & Advanced Tab

#### Task F5.1: Preset-Definitionen

- **Files:**
  - `src/core/client/config-presets.js` (neu)
  - `src/modbus-client.html` (Preset-Dropdown)
- **Action:**
  - Presets: `plain-tcp`, `tls-production`, `tls-lab`, `serial-rtu`, `high-latency`
  - `oneditprepare`: Preset-Auswahl → Felder setzen (mit Confirm wenn dirty)
- **Test:** `test/units/modbus-client-presets-test.js` (Editor-Logik als pure fn testbar)

#### Task F5.2: Fehlende TLS-Felder im Editor

- **Files:** `src/modbus-client.html`
- **Action:** UI für `tlsSecureProtocol` (dropdown), `tlsCheckServerIdentity` (checkbox)
- **i18n:** `src/locales/en-US/modbus-client.json`, `de-DE/modbus-client.json`

#### Task F5.3: Advanced Tab — Resilience (Task 12 v6)

- **Files:**
  - `src/modbus-client.html`
  - `src/modbus-client.js` (wire circuit breaker / retry wenn enabled)
- **Fields:** `circuitBreakerEnabled`, `retryEnabled`, `connectionPoolEnabled` — default `false`
- **Test:** Unit — disabled by default; enabled path mocked

#### Task F5.4: Deprecation UX Legacy TLS Node

- **Files:** `src/modbus-client-tls.html`
- **Action:** Banner „Migrate to modbus-client with Enable TLS“ + Link Help
- **Non-breaking:** Node bleibt registriert

---

### F6 — I/O-Node Options & i18n

#### Task F6.1: Options-Tab vereinheitlichen

- **Files:** `src/modbus-read.html`, `modbus-write.html`, `modbus-getter.html`, `modbus-flex-*.html`
- **Fields:** `suppressNotReadyWarnings`, `emptyMsgOnFail`, `keepMsgProperties`, `showStatusActivities` — konsistent
- **Test:** Bestehende Unit-Tests — keine Regression

#### Task F6.2: Help-Texte & MIGRATION

- **Files:** `docs/MIGRATION-v6.md`, HTML `<script type="text/html" data-help-name="modbus-client">`
- **Action:** Presets, TLS-Checkbox, Advanced-Tab dokumentieren

#### Task F6.3: IO-Config UX (minimal)

- **Files:** `src/modbus-io-config.html`
- **Action:** Format-Hilfetext, Validierung `path` non-empty, Link zu `extras/ioFileData/` Beispiel
- **Test:** `test/e2e/modbus-io-config-e2e-test.js` erweitern

---

### F7 — Skips, CI, Abschluss

#### Task F7.1: Verbleibende Skips

- **Files:** siehe `fc-test-matrix.md` ⏭-Einträge
- **Priority:**
  1. `modbus-flex-fc-e2e` (2)
  2. `modbus-connection-pool` (3 — implement or Won't Fix dokumentieren)
  3. `modbus-client-isolated` (1)
  4. `modbus-robust-flow` / `working-flow` (Mock-Smoke)

#### Task F7.2: Auskommentierte Tests reaktivieren

- **Files:** `modbus-client-test.js`, `modbus-getter-test.js`, `modbus-read-test.js` (~30 `it()`)
- **Action:** Batchweise mit v6-Semantik (`activated`-Gate)

#### Task F7.3: CI & Metriken

- **Files:** `.github/workflows/*` (falls vorhanden) oder `package.json`
- **Action:**
  - Job `test` — Standard Mocha
  - Job `test:integration` — optional / nightly
  - Coverage-Schwellwert Client-Core ≥ 85 %

#### Task F7.4: CHANGELOG & Review

- **Files:** `CHANGELOG.md`, `docs/p4nr/reviews/coverage-settings-upgrade.review.md` (Team 2)
- **Done when:** GATE 2 — Volllauf + Integration grün

---

## Test-Datei-Inventar (neu geplant)

```
test/
├── helper/
│   ├── fc-e2e-helper.js          (extend)
│   └── tls-e2e-helper.js         (new)
├── core/client/
│   ├── modbus-connection-tls-test.js
│   ├── modbus-fc-executor-test.js
│   └── modbus-client-security-test.js
├── e2e/
│   ├── modbus-read-tls-e2e.test.js
│   ├── modbus-write-tls-e2e.test.js
│   ├── modbus-getter-tls-e2e.test.js
│   ├── modbus-flex-getter-e2e.test.js
│   ├── modbus-flex-getter-tls-e2e.test.js
│   ├── modbus-flex-write-tls-e2e.test.js
│   ├── modbus-client-connection-e2e.test.js
│   ├── modbus-queue-info-e2e.test.js
│   └── modbus-response-filter-e2e.test.js
├── integration/
│   ├── tls-handshake.test.js
│   ├── tls-security.test.js
│   └── modbus-tls-docker.test.js   (opt-in)
└── units/
    └── modbus-client-presets-test.js
```

**Geschätzte neue Tests:** +80–120 `it()` (Mock-Tier), +8–12 Integration.

---

## Commit-Strategie (pro grüner Phase)

| Phase | Commit-Prefix | Beispiel |
|-------|---------------|----------|
| F0 | `test:` | `test: add tls-e2e-helper and integration mocha config` |
| F1 | `test(core):` | `test(core): tls options builder and fc-executor coverage` |
| F2 | `test(e2e):` | `test(e2e): flex-getter and flex-fc matrix plain tcp` |
| F3 | `test(e2e):` | `test(e2e): tls fc matrix for read write getter flex` |
| F4 | `test(integration):` | `test(integration): real tls handshake read fc3` |
| F5 | `feat(client):` | `feat(client): config presets and advanced settings tab` |
| F6 | `feat(ui):` | `feat(ui): unify io node options and i18n` |
| F7 | `chore:` | `chore: close test skips and add integration ci job` |

---

## Risks & Rollback

- **Flaky TLS Integration:** Job non-blocking; Mock-Tier bleibt PR-Gate
- **Preset-Breaking:** Presets nur additive Defaults; Rollback = Dropdown entfernen
- **Test-Zeit > 10 min:** Kategorien splitten (`test:fast` ohne E2E)

## GATE 1 Checklist (Human)

- [ ] FC-Matrix-Umfang OK (80/20 vs. 100 %)?
- [ ] Integration-Tier blocking oder nightly?
- [ ] Preset „tls-lab“ mit Warnung akzeptabel?
- [ ] Resilience Advanced-Tab in Scope?

## GATE 2 Checklist (Human)

- [ ] `npm test` — 0 failing
- [ ] `npm run test:integration` — grün (lokal/CI)
- [ ] Editor manuell: Preset anwenden, TLS aktivieren, Read deployen
- [ ] Keine PEM-Inhalte in Debug-Log
