# Migration Guide: v5 OSS → v6 closed

**Package:** `@plus4nodered/node-red-contrib-modbus` 6.x  
**v5 OSS:** `node-red-contrib-modbus` (BIANCO-ROYAL/node-red-contrib-modbus)  
**Status:** v6.0.0 — Node-RED 4.x und 5.x kompatibel

## Überblick

v6 ist ein **Major Release** mit bewussten Verhaltensverbesserungen, Core-Refactoring und TLS-Integration. Flows aus v5 funktionieren in der Regel weiter, aber Timing, Reconnect und Send-Gates können sich ändern.

**Mindestanforderungen v6:**

- Node-RED ≥ 4 (getestet mit **Node-RED 4.x und 5.x**)
- Node.js ≥ 18.5

---

## Breaking Changes

### 1. Senden nur im Zustand `activated`

**v5:** Nachrichten wurden auch im FSM-Zustand `connected` akzeptiert (`messageAllowedStates` enthielt `connected`).

**v6:** Nur `activated` (`mbactive`-Event) ist send-fähig. Nachrichten vor `mbactive` werden mit `node.warn('Modbus client not ready')` abgelehnt.

**Migration:**

- Flows, die sofort nach Deploy senden: kurzen Delay oder auf `mbactive`-Event warten
- Read-Nodes mit „Delay on Start": Standard-Delay beibehalten oder erhöhen
- Option `suppressNotReadyWarnings` pro Node, wenn Warnungen stören (Senden bleibt blockiert)

---

### 2. Reconnect-Verhalten

**v5:** Jeder `closed`-Zustand löste automatisch `RECONNECT` aus.

**v6:** Reconnect nur bei Netzwerkfehler/Timeout und wenn `reconnectOnTimeout` aktiv ist. Kein Reconnect bei:

- explizitem Node-Stop (`stop`)
- Dynamic Reconnect / Parameterwechsel (`switch`)
- manuellem Close

**Migration:**

- Flows die nach bewusstem Close **keinen** Reconnect wollen: funktionieren jetzt korrekt ohne Workaround
- Flows die Reconnect nach **jedem** Close erwarten: `reconnectOnTimeout` prüfen; bei manuellem Close ggf. erneut `INIT` triggern

---

### 3. `modbus-client-tls` Node entfällt

**v5:** Separater Config-Node `modbus-client-tls`.

**v6:** TLS über `modbus-client` mit `clienttype: tcp-tls`. Ein FSM-Pfad für alle Transporte.

**Migration:**

1. Bestehenden `modbus-client-tls` durch `modbus-client` ersetzen
2. Client-Typ auf **TCP TLS** setzen
3. Zertifikate weiterhin über Node-RED Credential Store (nicht im Flow-JSON)
4. `tlsRejectUnauthorized: true` beibehalten (Default)

**Entfernte Node-Typen in `package.json`:**

- `modbus-client-tls`

---

### 4. Not-ready Input einheitlich

**v5:** Inkonsistent — manche Nodes enqueueten still, andere warnten.

**v6:** Alle Client-abhängigen Nodes nutzen `isClientReadyToSend()`. Default: `node.warn`, kein Enqueue.

**Betroffene Nodes:** `modbus-read`, `modbus-write`, `modbus-getter`, `modbus-flex-getter`, `modbus-flex-write`, `modbus-flex-connector`, `modbus-flex-sequencer`

---

### 5. Resilience (Circuit Breaker, Retry)

**v5:** Module vorhanden, im Runtime-Pfad nicht verdrahtet.

**v6:** Opt-in pro Client-Config:

| Option | Default | Beschreibung |
|--------|---------|--------------|
| `circuitBreakerEnabled` | `false` | Circuit Breaker bei wiederholten Fehlern |
| `retryEnabled` | `false` | Exponential Backoff vor Fehler-Propagation |

**Migration:** Keine Aktion nötig — Defaults entsprechen v5-Verhalten (deaktiviert). Im Editor unter Tab **Advanced** (`circuitBreakerEnabled`, `retryEnabled`, `connectionPoolEnabled`).

---

### 6. Interne Core-API

**v5:** Legacy-Namespace `de.biancoroyal.modbus.*` in `src/core/`.

**v6:** ES2019-Module unter `src/core/client/` und `src/core/queue/`. Direkte Requires auf Legacy-Namespaces **unsupported**.

**Migration:** Nur relevant für Forks mit direktem Core-Zugriff — auf `src/core/client/index.js` umstellen.

---

## Verhaltens-Fixes (kein Breaking, aber sichtbar)

| Thema | v5-Problem | v6-Fix |
|-------|------------|--------|
| #532 TCP RST | Node-RED-Crash bei ECONNRESET | Fehler abgefangen, Reconnect |
| #536 Exception 11 | Memory Leak, Queue hängt | Queue für Unit-ID geleert |
| #540 NR 4.1 Buffer | FC3 falsche Werte | Deep-Clone vor `msg.payload` |
| FSM-Hänger | Tests/Flows hängen in `sending` | Timer-Manager + State-Validator |

---

## FSM-Änderung (intern)

| v5 (16 Zustände) | v6 (12 Zustände) |
|------------------|------------------|
| `new` | entfällt (initial: `init`) |
| `reading`, `writing` | → `sending` |
| `empty` | → `activated` |
| Rest | unverändert |

**Globale Events (`mbinit`, `mbconnected`, `mbactive`, …) bleiben stabil.**

---

## Checkliste vor Upgrade

- [ ] Node.js ≥ 18.5
- [ ] Node-RED ≥ 4.0.9 (4.1+ empfohlen wegen Buffer-Fix)
- [ ] `modbus-client-tls` → `modbus-client` mit TLS migrieren
- [ ] Flows mit sofortigem Send nach Deploy: `mbactive` abwarten
- [ ] Reconnect-Erwartungen nach manuellem Close prüfen
- [ ] Custom-Forks: Legacy-Namespace-Requires entfernen

---

## Client-Konfigurationsprofile (Presets)

Der `modbus-client`-Editor bietet optionale **Configuration profiles** (Plain TCP, TLS Production, TLS Lab, Serial RTU, High Latency). Presets setzen empfohlene Defaults; Zertifikate bleiben im Credential Store.

- Bestehende Flows unverändert (Preset leer = custom)
- TLS Production: `tlsRejectUnauthorized` und `tlsCheckServerIdentity` aktiv
- TLS Lab: nur für Tests/Lab — **nicht** in Produktion
- Legacy `modbus-client-tls`: Deprecation-Hinweis im Editor; siehe §3
- Editor-Felder: `tlsSecureProtocol` (TLSv1.2/1.3), `tlsCheckServerIdentity`, Resilience unter Tab **Advanced**

---

## Siehe auch

- **Test-Baseline (Task 0):** `docs/p4nr/capabilities/v6-quality-hardening-baseline.md`
- **Issue-Matrix:** `docs/p4nr/capabilities/v6-quality-hardening-issues.md`
- Capability-Spec: `docs/p4nr/capabilities/v6-quality-hardening.md`
- Implementierungsplan: `docs/p4nr/plans/v6-quality-hardening.plan.md`
- Security: `docs/security/README.md`
- Architecture: `docs/architecture/ARCHITECTURE.md`
