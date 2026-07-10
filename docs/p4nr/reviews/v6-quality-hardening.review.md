# Spec Review: v6 Quality Hardening

**Date:** 2026-06-13
**Reviewer:** p4nr-spec-reviewer
**Artifacts reviewed:**
- `docs/p4nr/capabilities/v6-quality-hardening.md`
- `docs/p4nr/plans/v6-quality-hardening.plan.md`
- `docs/MIGRATION-v6.md` (Kontext-Entwurf)

---

## Verdict

**APPROVE**

Keine CRITICAL-Befunde. Alle Open Questions sind als Entscheidungen (GATE 1 — 2026-06-13) geschlossen. Der Plan enthält konkrete Dateipfade, benannte Tests für die meisten Tasks und explizite Build-Schritte. Die Breaking-Change-Policy ist klar dokumentiert.

---

## Checklist-Ergebnis

### A. Completeness ✅

| Item | Status | Bemerkung |
|------|--------|-----------|
| Capability-Name, Actor, Outcome, Success-Signal | ✅ | Klar definiert im Summary |
| Node-RED-Surface (Typ, Config, Wires) | ✅ | Tabelle in §Node-RED Surface; Removal `modbus-client-tls` explizit |
| Message Contract (`msg.payload`, Errors) | ✅ | §Message Contract + Error-Paths-Tabelle |
| Non-Goals | ✅ | 6 Punkte aufgeführt |
| Open Questions leer | ✅ | In "Decisions (GATE 1 — 2026-06-13)" überführt; 5/5 entschieden |

### B. Plan Quality ✅

| Item | Status | Bemerkung |
|------|--------|-----------|
| `task_list` mit exakten Repo-Pfaden | ✅ | Alle 18 Tasks führen konkrete `src/`- und `test/`-Pfade auf |
| Tasks klein, geordnet, unabhängig testbar | ✅ | Empfohlene Reihenfolge im Plan; Breaking-Tasks (4, 5, 9) klar markiert |
| Jeder Task nennt Failing-Test (RED) | ⚠️ | Tasks 3, 10, 17 ohne eigenen Testdateipfad — siehe MEDIUM-Findings |
| Build-Schritt nach `src/`-Änderungen | ✅ | "Nach jeder Task-Gruppe: `npm run build && npm test`" |
| Keine vagen Aktionen | ✅ | Alle Aktionen spezifisch (kein "refactor broadly" o.ä.) |

### C. Node-RED / P4NR Conventions ✅

| Item | Status | Bemerkung |
|------|--------|-----------|
| `src/` + `modbus/` Build-Pipeline | ✅ | Alle Code-Tasks arbeiten in `src/`; Build explizit |
| HTML-Editor-Datei bei UI-Änderung | ✅ | Task 9: `src/modbus-client.html` eingeschlossen |
| Locale-Dateien bei User-Strings | ✅ | Task 9: `src/locales/` erwähnt |
| Test-Flows + Dynamic-Port-Helper | ✅ | Port-Helper per SKILL.md etabliert; Flow-Fixtures referenziert |
| Kein Server-Node in diesem Paket | ✅ | "Server: `@plus4nodered/node-red-contrib-modbus-server` (separates Repo)" |

### D. Security ✅

| Item | Status | Bemerkung |
|------|--------|-----------|
| Credentials via Node-RED Credential Store | ✅ | Spec §Constraints + MIGRATION-v6.md §3 explizit |
| Input-Validierung vor Bus-Zugriff | ✅ | Unit-ID-Ranges + FC-Range in §Modbus-Spec & Security |
| Kein `eval` / `new Function` / unsafe `child_process` | ✅ | Nicht erwähnt, kein Anhaltspunkt für Risiko |
| TLS-Handling nach `modbus-client-tls`-Mustern | ✅ | Task 9: Credential-Store, `tlsRejectUnauthorized: true` default |

### E. Test Strategy ✅

| Item | Status | Bemerkung |
|------|--------|-----------|
| Mocha + `node-red-node-test-helper` | ✅ | "Jest für Node-RED-Node-Tests" in Non-Goals |
| Unit- und E2E-Pfade konkret benannt | ✅ | §Test Strategy benennt 6 neue Testdateien; Issue-Matrix mit je 1 E2E |
| Regression-Risiko adressiert | ✅ | Task 16 entfernt Auto-ACTIVATE-Patch, reaktiviert Skipped-Tests mit v6-Erwartungen |

---

## Findings

| Severity | Area | Finding | Required action |
|----------|------|---------|-----------------|
| MEDIUM | Plan §Prerequisites | Text "Open Question #2" — wurde in Spec zu "Decisions" umbenannt, Terminologie veraltet | Team 3 ignoriert Checkbox-Label; kein Blocker — aber Team 1 kann bei Gelegenheit aktualisieren |
| MEDIUM | Plan Task 3 (FSM-Handler) | Kein konkreter Testdateipfad für RED-Test; nur "Handler-Unit-Tests mit Mock-Node" | Team 3 soll `test/core/client/modbus-fsm-handler-test.js` anlegen und diesen Pfad als RED-Target verwenden |
| MEDIUM | Plan Task 17 (Lifecycle-Fixes) | "Register/Deregister-Zyklus" ohne Testdatei-Name | Team 3 soll Testdatei `test/units/modbus-client-lifecycle-test.js` (oder bestehende) explizit benennen |
| MEDIUM | Plan Task 10 (Client-Slim) | "Volle Client-Test-Suite" als Test — kein neuer Failing-Test, nur Regressionssicherung | Akzeptabel für reinen Wiring-Cleanup; kein Blocker |
| LOW | MIGRATION-v6.md Referenzen | `docs/security/README.md` und `docs/architecture/ARCHITECTURE.md` sind verlinkt, existieren noch nicht | Werden in Task 18 erstellt; kein Implementations-Blocker |
| LOW | Plan §Prerequisites Checkboxen | Alle Prerequisites sind `[ ]` (ungehakt) inkl. "Team 2 APPROVE" | Normal vor diesem Review; Team 3 hakt nach GATE 1 ab |

---

## Blockers

*Keine Blocker — APPROVE ohne offene Punkte.*

---

## Handoff to Team 3

**Entry Point:** Task 0 — Baseline & Breaking-Change-Register

### Approved Task List (Reihenfolge aus Plan)

```
Task 0  — Baseline: Test-Protokoll + MIGRATION-v6.md + Issue-Matrix
Task 1  — Core-Verzeichnisstruktur anlegen (Strangler-Skelett)
Task 2  — FSM extrahieren & vereinfachen (16→12) [HIGH-RISK]
Task 3  — FSM-Handler extrahieren          [MEDIUM] → Testdatei: test/core/client/modbus-fsm-handler-test.js anlegen
Task 4  — Post-Connect ACTIVATE + messageAllowedStates [HIGH-RISK, Breaking]
Task 5  — Reconnect Intent-Guard           [MEDIUM, Breaking]
Task 6  — Queue lazy init + Serial-Lock    [MEDIUM]
Task 7  — FC-Executor extrahieren          [MEDIUM]
Task 8  — Connection-Factory extrahieren   [MEDIUM]
Task 9  — TLS in modbus-client integrieren [HIGH-RISK, Breaking]
Task 10 — modbus-client.js auf Wiring reduzieren [MEDIUM]
Task 11 — Ready-to-Send in alle Client-Nodes [LOW]
Task 12 — Resilience verdrahten (opt-in)   [MEDIUM]
Task 13 — Netzwerk-Fehler #532 + Exception 11 #536 + Buffer #540 [HIGH-RISK]
Task 14 — State Validator + Timer Manager  [LOW]
Task 15 — Legacy-Namespace entfernen       [MEDIUM]
Task 16 — Test-Suite auf v6-Verhalten umstellen [MEDIUM]
Task 17 — Lifecycle-Fixes                  [LOW] → Testdatei explizit benennen
Task 18 — Dokumentation & Release-Artefakte [LOW]
```

### Hinweise für Team 3

1. **Breaking-Change-Gate (Tasks 4, 5, 9):** Nach jedem Breaking-Task `npm run build && npm test` — kein Weitergehen ohne grüne Tests.
2. **Task 3 Testpfad:** `test/core/client/modbus-fsm-handler-test.js` als neuen RED-Test anlegen.
3. **Task 17 Testpfad:** Bestehende oder neue Datei für Register/Deregister-Zyklus explizit benennen.
4. **FSM 16→12 (Task 2):** Alle bestehenden Transition-Tests updaten — in Task 0 als `update-for-v6` kategorisieren.
5. **TLS-Removal (Task 9):** `package.json` `node-red.nodes`-Eintrag für `modbus-client-tls` entfernen; Editor-Hilfetext mit Migrationshinweis versehen.
6. **SKILL.md-Hinweis:** Das Skill-File referenziert "follow `modbus-client-tls` patterns" — gemeint sind die Credential-Store- und node-forge-Muster, nicht der entfernte Node-Typ.
