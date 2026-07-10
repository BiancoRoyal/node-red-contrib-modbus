# v6 Quality Hardening — GitHub Issue Matrix (Task 0)

**Source:** `BiancoRoyal/node-red-contrib-modbus` (v5 OSS)  
**Export:** 2026-06-13 via `gh issue list --state all --limit 150`  
**Legende:** `fix` | `test` | `wontfix` | `defer` | `server-pkg` | `docs`

---

## Offene Issues (v6 Priorität)

| # | Titel | Labels | v6-Aktion | Plan-Task | Regressionstest |
|---|-------|--------|-----------|-----------|-----------------|
| [569](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/569) | Error: Timed out at modbus-client-core.js:44:15 | bug | **fix** | 2, 5, 14 | `modbus-fsm-transitions-test.js`, Timer-Tests |
| [568](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/568) | unitId vs unitid issue | bug, Stale | **fix** | 11 | `modbus-client-ready-test.js` — msg.unitId Konsistenz |
| [564](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/564) | Modbus Communication Failure | bug | **fix** | 4–5, 13 | Client-Reconnect + Error-Klassifikation E2E |
| [567](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/567) | Feature request / maintainership question | Stale | **docs** | 18 | — |

---

## Plan-kritische Issues (geschlossen, v6 abgesichert)

| # | Titel | Status | v6-Aktion | Plan-Task | Regressionstest |
|---|-------|--------|-----------|-----------|-----------------|
| [532](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/532) | Node-Red crashes due to RST-TCP flag | CLOSED, Stale | **fix** | 13 | `modbus-client-tcp-error-test.js` |
| [536](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/536) | Memory leak on modbus exception 11 | CLOSED | **test** | 13 | `modbus-queue-core-test.js` |
| [540](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/540) | Modbus-Read not working after NR 4.1.0 | CLOSED, Stale | **fix** | 13 | `modbus-read-test.js` Buffer-Clone |
| [537](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/537) | writing to modbus-server directly broken | CLOSED, Stale | **server-pkg** | — | `@plus4nodered/node-red-contrib-modbus-server` |

---

## FSM / Client / Reconnect (stale closed → v6 triage)

| # | Titel | v6-Aktion | Plan-Task | Notiz |
|---|-------|-----------|-----------|-------|
| [472](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/472) | Internal state-machine corrupted | **fix** | 2–5, 14 | Kernmotivation FSM-Härtung |
| [493](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/493) | fsm failed state after sending | **fix** | 2, 7, 14 | Validator + FC-Executor |
| [504](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/504) | Intermitent failure on state connected | **fix** | 4 | ACTIVATE nach Connect |
| [520](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/520) | Modbus Failure On State sending | **fix** | 2–5 | FSM-Handler |
| [544](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/544) | Modbus Serial \| Failure on State sending | **fix** | 8 | Serial-Connection-Factory |
| [467](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/467) | FSM failed is not under normal condition | **test** | 2 | Verhalten dokumentieren in MIGRATION-v6 |
| [376](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/376) | Client Not Ready At State init on deploy | **fix** | 4, 11 | Ready-to-Send + Delay on Start |
| [481](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/481) | Flex-Connector actualServiceState | **fix** | 11 | isClientReadyToSend |
| [458](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/458) | Auto reconnect upon re-establishing Ethernet | **test** | 5 | Intent-Reconnect E2E |
| [446](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/446) | Reconnect timeout for RTU slave behind gateway | **defer** | 12 | Resilience opt-in |
| [416](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/416) | after modbus failure no initialize possible | **fix** | 5, 17 | broken→reconnect Lifecycle |
| [553](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/553) | Node dies silently | **fix** | 13 | Error-Propagation |

---

## Ready-to-Send / Flex (docs/TODO.md)

| # | Titel | v6-Aktion | Plan-Task |
|---|-------|-----------|-----------|
| [496](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/496) | Flex Getter not changing unitid | **fix** | 11 |
| [476](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/476) | Flex Connector not setting unit id | **fix** | 11 |
| [482](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/482) | unitId → unitid when keep msg properties | **fix** | 11 |
| [549](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/549) | Queue off unable to read multiple devices | **test** | 6 |
| [409](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/409) | Flex Getter Queue reset on timeout | **test** | 6, 13 |

---

## Netzwerk / TCP / Serial

| # | Titel | v6-Aktion | Plan-Task |
|---|-------|-----------|-----------|
| [548](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/548) | flex-server dropping port after ECONNRESET | **server-pkg** | — |
| [451](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/451) | Modbus TCP stops after days | **test** | 5, 14 | Long-run defer v6.1 |
| [560](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/560) | RTU restart in docker | **test** | 8 | Serial reconnect |
| [551](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/551) | Intermittent RTU slave failure v5.45.1 | **test** | 8 | Serial stability |

---

## Won't Fix / Out of Scope v6

| # | Titel | v6-Aktion | Grund |
|---|-------|-----------|-------|
| [340](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/340) | Writing negate integer (SunSpec-adjacent) | **defer** | Non-Goals Spec |
| [477](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/477) | FC20 Read File Record | **defer** | Feature |
| [429](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/429) | Function Code 43 | **defer** | Feature |
| [478](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/478) | UDP support | **defer** | Feature |
| [348](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/348) | Modbus Client State Node | **defer** | Feature (mb* Events existieren) |
| [510](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/510) | Sequencer msg.topic = name | **wontfix** | Label wontfix |
| [373](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/373) | cannot disable warnings and logs | **partial** | `suppressNotReadyWarnings` Task 11 |

---

## Server / Security (separates Paket oder defer)

| # | Titel | v6-Aktion |
|---|-------|-----------|
| [537](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/537) | modbus-server write | server-pkg |
| [492](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/492) | modbus-server-core fixes | server-pkg |
| [406](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/406) | vm2 security | **fix** (v6 closed — kein vm2) |
| [450](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/450) | Replace vulnerable vm2 | **fix** | v6 ohne vm2 prüfen |

---

## Statistik Export (150 neueste Issues)

| Kategorie | Anzahl |
|-----------|--------|
| OPEN | 4 |
| CLOSED (in Sample) | 146 |
| Label `bug` | ~60 |
| Label `Stale` | ~90 |
| Label `handled by plus4nodered team` | ~25 |

**Hinweis:** Vollständiger Export (>150 Issues) bei Bedarf mit `--limit 500` wiederholen.

---

## Mapping → Plan-Tasks

| Task | Issues |
|------|--------|
| 2–5 FSM | 472, 493, 504, 520, 544, 569 |
| 4, 11 Ready | 376, 481, 496, 476, 482, 568 |
| 5 Reconnect | 458, 416, 560 |
| 13 Netzwerk/Buffer | 532, 536, 540, 553, 564 |
| 9 TLS | (kein Issue — Architektur-Entscheidung v6) |
| 18 Docs | 567 |
