# Capability: Comprehensive Coverage, TLS Assurance & Settings UX

## Summary

**Wer:** P4NR Team 1 → Team 2 Review → Team 3 Implementierung  
**Branch:** `upgrade_settings`  
**Was:** Systematische Erweiterung der Test-Abdeckung (Plain TCP **und** TLS) für Read/Write/FCs und alle Flex-Varianten, plus Settings-/Template-UX, damit neue Parameter in der Node-RED-Konfiguration **sichtbar, nutzbar und dokumentiert** sind.  
**Erfolgssignal:**

- **Test-Matrix grün:** Jede I/O-Node-Variante × relevante FCs × Transport (TCP, TLS) — mindestens ein automatisierter Test mit FC-Assertions
- **TLS-Vertrauen:** Echte TLS-Handshake-Tests (CI-Tier „integration“) plus schnelle Mock-Tier für Unit/E2E-Alltag
- **548+ passing, 0 failing** im Standard-`npm test`; Integration-Tier separat (`npm run test:integration`)
- **Settings vollständig:** Alle in `defaults`/Runtime vorhandenen Parameter im Editor exponiert (inkl. `tlsSecureProtocol`, `tlsCheckServerIdentity`, Resilience-Opt-in)
- **Config-Templates:** Mindestens Client-Presets (Plain TCP, TLS Production, TLS Lab, Serial RTU) + dokumentierte Erweiterung für Flex-FC/IO
- **Sicherheit:** Keine Credential-Leaks in Logs; `rejectUnauthorized`-Verhalten getestet; MIGRATION-/Help-Texte aktualisiert

## Beziehung zu v6 Quality Hardening

Diese Capability **erweitert** `v6-quality-hardening` (APPROVE), ersetzt sie nicht:

| v6-Task | Status | Erweiterung hier |
|---------|--------|------------------|
| Task 9 TLS in `modbus-client` | teilweise | Templates + fehlende UI-Felder + TLS-FC-Matrix |
| Task 12 Resilience opt-in | offen | UI-Tab + Runtime-Wiring + Tests |
| Task 16 Test-Suite | teilweise (548 pass) | TLS/FC-Matrix, Integration-Tier, Skips schließen |
| Editor Non-Goal | „nur TLS-Hinweis“ | **bewusst erweitert** — Nutzeranfrage: bessere UX ohne Full-Redesign |

## Problemstellung

### Tests

| Lücke | Ist-Zustand | Risiko |
|-------|-------------|--------|
| TLS E2E | `modbus-client-tls-e2e.test.js` prüft Deploy/Registrierung, **keine FC-Daten**, Mocks aktiv | TLS-Regression unbemerkt |
| FC E2E | Plain TCP via `fc-e2e-helper.js` (Phase A–E) | TLS-Pfad ungetestet |
| Transport | Alle FC-E2E schließen `modbus-client-tls` explizit aus | `tlsEnabled: true` am integrierten Client ungetestet |
| `modbus-server-tls` | Nur Smoke-Load aus Server-Paket | Kein End-to-End Read/Write über TLS-Server |
| Flex-Varianten | Getter/Sequencer/Connector/FC teils nur Unit | Produktions-Stabilität ungleich |
| Security | Keine Tests für Cert-Reject, Env-Vars, Identity-Check | Compliance-Risiko |

### Settings & UX

| Lücke | Ist-Zustand |
|-------|-------------|
| TLS-Parameter | `tlsSecureProtocol`, `tlsCheckServerIdentity` in `defaults`, **nicht im Editor** |
| Resilience | Nur in Legacy-`modbus-client-tls.html`, nicht in `modbus-client.html` |
| i18n TLS | Inline-Fallback in HTML; keine Keys in `locales/en-US/modbus-client.json` |
| Presets | Flex-FC hat `extras/argumentMaps/`; Client hat keine Profil-Vorlagen |
| I/O-Nodes | `suppressNotReadyWarnings` in Runtime, Editor teils ohne Feld |
| IO-Config | Minimal (4 Felder), kein Preview/Validierung |

## Zielbild

### Test-Pyramide (zwei Tiers)

```
                    ┌─────────────────────────┐
                    │  Integration (CI slow)   │  Echter TLS-Handshake,
                    │  test/integration/tls-*  │  modbus-server-tls, Docker optional
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │  E2E FC-Matrix (Mock-Transport)      │  fc-e2e-helper + tlsEnabled flows
              │  Plain TCP + TLS-configured client   │  FC1–16 Assertions
              └─────────────────┬─────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        │  Unit / Core                                       │  FSM, FC-Executor, tlsOptions builder,
        │  test/core/client/*, test/units/*                  │  guardClientReadyToSend, state validator
        └───────────────────────────────────────────────────┘
```

**Standard-`npm test`:** Mock-Tier (schnell, ~8 min).  
**`npm run test:integration`:** TLS-Handshake + optional Docker (`example/modbus-tls-docker/`).

### FC-/Node-Matrix (Mindestabdeckung)

| Node | FC / Verhalten | Plain TCP | TLS Client |
|------|----------------|-----------|------------|
| `modbus-read` | FC1–4 (poll) | ✅ existiert | neu |
| `modbus-write` | FC5/6/15/16 | ✅ existiert | neu |
| `modbus-getter` | FC1–4 (trigger) | ✅ existiert | neu |
| `modbus-flex-getter` | FC1–4 + error/keepProps | Unit | E2E neu |
| `modbus-flex-write` | FC5/6/15/16 + error/batch | ✅ existiert | neu |
| `modbus-flex-fc` | Custom FC + templates | teilweise | neu |
| `modbus-flex-sequencer` | Multi-step | skip | neu |
| `modbus-flex-connector` | Dynamic unit/route | E2E | neu |
| `modbus-io-config` | IO mapping | E2E | N/A (Config) |
| `modbus-queue-info` | Queue metrics | Unit | neu (TLS client) |
| `modbus-response-filter` | Filter + IO | Unit | optional |

### Settings UX — Config-Templates

**Client-Presets** (Dropdown „Configuration profile“ in `modbus-client.html`):

| Preset | Setzt |
|--------|-------|
| `plain-tcp` | `tlsEnabled: false`, Standard-Timeouts |
| `tls-production` | `tlsEnabled: true`, `tlsRejectUnauthorized: true`, `tlsCheckServerIdentity: true`, `TLSv1_3_method` |
| `tls-lab` | `tlsEnabled: true`, `rejectUnauthorized: false` (mit UI-Warnung) |
| `serial-rtu` | `clienttype: serial`, RTU-Buffered Defaults |
| `high-latency` | erhöhte `clientTimeout`, `commandDelay`, `reconnectOnTimeout` |

Presets **überschreiben nur leere Felder** oder explizit bestätigte Felder (Dialog „Apply preset?“).

**Erweiterter Tab „Advanced“** (4. Tab in `modbus-client.html`):

- Resilience: `circuitBreakerEnabled`, `retryEnabled`, `connectionPoolEnabled` (opt-in, default `false`)
- TLS: `tlsSecureProtocol`, `tlsCheckServerIdentity`
- Diagnostics: `stateLogEnabled`, `queueLogEnabled` (verschoben aus Options für Klarheit)

**I/O-Nodes:** Tab Options → `suppressNotReadyWarnings`, `keepMsgProperties`, `emptyMsgOnFail` konsistent + i18n.

## Node-RED Surface (Änderungen)

| Datei | Änderung |
|-------|----------|
| `src/modbus-client.html` | Presets, Advanced-Tab, fehlende TLS-Felder, i18n |
| `src/modbus-client.js` | `applyTlsOptionsFromConfig()` — keine Log-Ausgabe von PEM-Inhalten |
| `src/locales/*/modbus-client.json` | TLS + Preset-Strings |
| `src/modbus-read.html` … `modbus-flex-*.html` | Options-Felder vervollständigen |
| `src/modbus-io-config.html` | Optional: Pfad-Hint, Format-Hilfe (Phase 2 UX) |

Keine neuen Palette-Nodes. Legacy `modbus-client-tls` bleibt bis v6.1 Deprecation-Warnung im Editor.

## Message Contract

Unverändert gegenüber v6-Spec. Zusätzliche **Test-Verträge:**

- Write-Nodes: `msg.input.payload.fc` (v6)
- Read/Getter: `msg.input.payload.fc`, `msg.payload` als Array
- TLS-Fehler: `msg.error` oder leeres Payload bei `emptyMsgOnFail: true`

## Security Requirements

1. **Credentials** nur über Node-RED `credentials` oder Env — nie in `node.log`/`winston` debug
2. **`tlsRejectUnauthorized: true`** default in Preset „Production“
3. **Tests:** Stub für `checkServerIdentity`; Integration mit ungültigem Cert → Verbindung scheitert
4. **Input-Validierung:** FC, Adresse, Quantity — bestehende Core-Tests erweitern
5. **Kein `eval`/`Function` in Templates** — Presets sind statische JSON-Maps

## Non-Goals

- Vollständiges Editor-Redesign / neues Theme
- TLS für Serial (Modbus RTU over TLS — out of scope)
- Server-TLS-Implementierung im Client-Repo (bleibt Server-Paket)
- Jest-Migration
- Performance-Benchmark-Suite

## Acceptance Criteria

### Tests

- [ ] FC-Matrix-Dokument `docs/p4nr/capabilities/fc-test-matrix.md` gepflegt, 100 % Mindestzellen grün (Mock-Tier)
- [ ] ≥ 12 neue TLS-E2E-Tests (Read/Write/Getter/Flex-Write × FC-Stichproben)
- [ ] ≥ 1 Integration-Test mit echtem TLS (`test/integration/tls-handshake.test.js`)
- [ ] 0 `it.skip` ohne dokumentierten Grund + Issue-Link
- [ ] `npm test` ≤ 10 min, 0 failures

### Settings

- [ ] Alle `defaults`-Keys aus `modbus-client.html` im Editor sichtbar oder bewusst „hidden“ dokumentiert
- [ ] ≥ 4 Client-Presets wählbar
- [ ] TLS-Felder in `en-US` + `de-DE` lokalisiert
- [ ] Help-Tab aktualisiert mit Preset- und TLS-Migrationshinweis

### Docs

- [ ] `docs/MIGRATION-v6.md` — Presets + TLS-Checkbox
- [ ] `TLS_INTEGRATION_TEST_GUIDE.md` — Verweis auf automatisierte Tests

## Risks

| Risiko | Mitigation |
|--------|------------|
| Echte TLS-Tests flaky in CI | Separater Integration-Job, retries=1, feste Ports aus `test/certificates/` |
| Presets überschreiben User-Config | Confirm-Dialog; Preset nur bei „New client“ auto |
| Test-Laufzeit explodiert | Matrix parametrisiert (`describe` + shared helper), parallele Dateien vermeiden |
| Legacy `modbus-client-tls` Drift | Presets + Deprecation-Banner im Legacy-Editor |

## Decisions (vor GATE 1 klären)

1. **Integration-Tier in CI?** Empfehlung: ja, als optionaler Job (nicht blocking für PR)
2. **Server-TLS E2E im Client-Repo?** Empfehlung: ja, gegen `@plus4nodered/node-red-contrib-modbus-server` devDependency
3. **Legacy `modbus-client-tls.html` Resilience-Felder:** merge nach `modbus-client.html` Advanced-Tab (Task 12)
4. **IO-Config Preview:** Phase 2 (nach Client-Presets) — separates Mini-Capability wenn nötig
