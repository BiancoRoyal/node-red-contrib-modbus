# FC Test Matrix — Tracking Document

Stand: Branch `upgrade_settings` (Initial).  
Legende: ✅ grün | 🔲 geplant | ⏭ skip/begründet | — nicht anwendbar

## Transport-Legende

| Code | Bedeutung |
|------|-----------|
| **TCP** | `modbus-client`, `tlsEnabled: false`, Mock oder 127.0.0.1 Server |
| **TLS** | `modbus-client`, `tlsEnabled: true` (Mock-Tier oder Integration) |

## Read Operations

| Node | FC1 | FC2 | FC3 | FC4 | Error | KeepProps | TCP | TLS |
|------|-----|-----|-----|-----|-------|-----------|-----|-----|
| modbus-read | ✅ | ✅ | ✅ | ✅ | 🔲 | — | ✅ | 🔲 |
| modbus-getter | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔲 |
| modbus-flex-getter | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 | 🔲 |

## Write Operations

| Node | FC5 | FC6 | FC15 | FC16 | Error | Batch | TCP | TLS |
|------|-----|-----|------|------|-------|-------|-----|-----|
| modbus-write | ✅ | ✅ | ✅ | ✅ | 🔲 | — | ✅ | 🔲 |
| modbus-flex-write | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 🔲 |

## Flex / Utility

| Node | Scope | TCP | TLS | Notiz |
|------|-------|-----|-----|-------|
| modbus-flex-fc | Custom FC | 🔲 | 🔲 | 2 Tests ⏭ |
| modbus-flex-sequencer | Sequence | ⏭ | 🔲 | 1 skip |
| modbus-flex-connector | Routing | ✅ | 🔲 | |
| modbus-flex-connector | emptyMsgOnFail | ✅ | 🔲 | |
| modbus-io-config | IO file | ✅ | — | |
| modbus-queue-info | Metrics | 🔲 | 🔲 | |
| modbus-response-filter | Filter | 🔲 | — | |
| modbus-response | Formatter | 🔲 | — | Unit only |

## Client / Connection

| Test | TCP | TLS Mock | TLS Integration |
|------|-----|----------|-----------------|
| Deploy + register | ✅ | ✅ | 🔲 |
| FC5 flex-write (mock) | — | ✅ | 🔲 |
| Reconnect | ✅ | 🔲 | 🔲 |
| Timeout handling | ✅ | 🔲 | 🔲 |
| Credentials / Env TLS | — | 🔲 | 🔲 |
| rejectUnauthorized | — | 🔲 | 🔲 |
| Wrong CA fails | — | — | 🔲 |

## Settings UX

| Feature | Status |
|---------|--------|
| tlsSecureProtocol in Editor | 🔲 |
| tlsCheckServerIdentity in Editor | 🔲 |
| Client Presets (≥4) | 🔲 |
| Resilience Advanced Tab | 🔲 |
| suppressNotReadyWarnings (I/O) | 🔲 |
| TLS i18n en-US / de-DE | 🔲 |
| Legacy TLS deprecation banner | 🔲 |

## Skip-Register

| Datei | Test | Grund | Ziel |
|-------|------|-------|------|
| modbus-connection-pool-test.js | retry, validate, metrics | Feature fehlt | Implement or Won't Fix |
| modbus-fc-flex-e2e-test.js | error/empty, client undefined | Port isolation | F2.2 |
| modbus-flex-sequencer-e2e-test.js | valid sequences | Deferred | F2.3 |
| modbus-client-isolated.test.js | no timeout | No server wire | F7.1 |

---

*Aktualisieren nach jeder Phase (Commit). Ziel: ≥ 90 % ✅ in TCP-Spalte, ≥ 80 % in TLS Mock-Spalte vor Release.*
