# Modbus Learning Path (v5)

This package ships a **numbered example curriculum** so you can learn both
**Modbus concepts** and **how each Node-RED node in this package is meant to be used**.

| Resource | Where |
|----------|--------|
| Runtime | Node.js `>= 22`, Node-RED `>= 4` |
| Example index + ports | [`examples/README.md`](../examples/README.md) |
| Flow files | [`examples/01-…` … `examples/18-…`](../examples/) |
| Deep dive (book) | [Leanpub: P4NR Contribution Modbus](https://leanpub.com/p4nr-contribution-modbus/) (Edition 2 for 5.60+) |
| Dynamic gateway (future / separate pkg) | [Issue #567](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/567), [capability draft](p4nr/capabilities/modbus-dynamic-server-gateway.md) |

---

## 1. How to start

1. Install `node-red-contrib-modbus` (Palette Manager or `npm install`).
2. Restart Node-RED.
3. **Import → Examples → node-red-contrib-modbus**.
- Prefer **one learning flow at a time** (each uses its own TCP demo port; client configs are **flow-scoped** and disappear when you delete the tab).
- Deploy, wait until the Modbus-Client status is active / reading, then use Inject / Debug / **each node's own** Modbus-Response as described in the **comment node** on the tab.
- Every example comment (and tab info) has **FEATURES IN THIS FLOW**, **WHAT THE CONFIG DOES**, and **HOW TO RUN** — that is the intended lesson for that flow.

Work **01 → 18** if you are new. Jump to a single **Node-…** flow if you already know Modbus and only need that node.

---

## 2. Path overview

```text
Basics & Getting started     01 → 02
Per-node tutorials           03 → 12, 17
Integration patterns         13 → 16, 18
```

### Stage A — Modbus + first connection

| # | Example | You learn |
|---|---------|-----------|
| 01 | `01-Modbus-Basics-Registers-And-FCs` | Coils, discrete inputs, holding/input registers; FC1–6 / 15–16; 0-based addresses; Unit ID |
| 02 | `02-Getting-Started-Client-And-Server` | Local `modbus-server` + `modbus-client` + polling `modbus-read` + `modbus-response` |

### Stage B — One flow per node

| # | Example | Node(s) |
|---|---------|---------|
| 03 | `03-Node-Read-Polling` | Modbus-Read |
| 04 | `04-Node-Getter-On-Demand` | Modbus-Getter |
| 05 | `05-Node-Flex-Getter-Dynamic` | Modbus-Flex-Getter |
| 06 | `06-Node-Write-And-Flex-Write` | Modbus-Write, Modbus-Flex-Write (FC6 / FC16) |
| 17 | `17-Node-Coils-Discrete-And-Bit-Writes` | Coil FC5/FC15 + Discrete FC2 (+ FC1 readback) |
| 07 | `07-Node-Flex-Sequencer` | Modbus-Flex-Sequencer |
| 08 | `08-Node-Flex-FC-Custom-Maps` | Modbus-Flex-FC (+ `extras/argumentMaps`) |
| 09 | `09-Node-Flex-Connector-Runtime-Switch` | Modbus-Flex-Connector |
| 10 | `10-Node-Queue-Info-And-Multi-Device` | Modbus-Queue-Info |
| 11 | `11-Node-IO-Config-And-Response-Filter` | Modbus-IO-Config, Modbus-Response-Filter |
| 12 | `12-Node-Server-Buffer-Slave` | Modbus-Server (buffer slave) |

### Stage C — Patterns

| # | Example | Pattern |
|---|---------|---------|
| 13 | `13-Pattern-HTTP-To-Modbus` | HTTP GET → Modbus read → HTTP response |
| 14 | `14-Pattern-Serial-RTU-Client` | Serial RTU client (needs hardware; educational) |
| 15 | `15-Pattern-Gateway-With-Buffer-Server` | Buffer “cache” slave today; pointer to flow-based gateway (#567) |
| 16 | `16-Bugfix-Shared-Client-Disable-Isolation` | Disable one Flex-Getter on a shared client — sibling must stay active (#423) |
| 18 | `18-Pattern-Ops-Timeout-And-Reconnect` | Timeout / reconnect honesty (5.60.1+); disturb local server and recover |

Full table and **TCP port map** (10502–10519): see [`examples/README.md`](../examples/README.md).

---

## 3. Modbus cheat sheet (as used in the examples)

| Area | Typical use | Read FC | Write FC |
|------|-------------|---------|----------|
| Coils | R/W bits | 1 | 5 (single), 15 (multi) |
| Discrete Inputs | R bits | 2 | — |
| Holding Registers | R/W words | 3 | 6 (single), 16 (multi) |
| Input Registers | R words | 4 | — |

- Addresses in this package are **0-based** (address `0` = first register/coil).
- **Unit ID** selects the slave (TCP often `1`; serial bus often unique per device).
- FC16 with `quantity: 1` needs `value: [n]`, not a bare number (see example 06 / issue history around address 0 writes).

Official protocol site: [modbus.org](http://www.modbus.org/).

---

## 4. Package nodes ↔ learning examples

| Palette node | Start here |
|--------------|------------|
| Modbus-Client | 02 (all TCP demos use a client config) |
| Modbus-Read | 03 |
| Modbus-Getter | 04, 13 |
| Modbus-Flex-Getter | 05, 14 |
| Modbus-Write / Flex-Write | 06 (registers), 17 (coils / FC5 / FC15) |
| Modbus-Read (Discrete / Coil) | 03 (FC1), 17 (FC2 + FC5/FC15) |
| Modbus-Flex-Sequencer | 07 |
| Modbus-Flex-FC | 08 |
| Modbus-Flex-Connector | 09 |
| Modbus-Queue-Info | 10 |
| Modbus-IO-Config / Response-Filter | 11 |
| Modbus-Server | 12, 15 |
| Modbus-Response | 02 (and most other flows) |

Node sidebar help also links to the matching example filename after install/`npm run build`.

---

## 5. IO file (example 11) — named values

**Start here:** [`extras/ioFileData/names-starter.json`](../extras/ioFileData/names-starter.json)

```json
{"name":"iTemperature","valueAddress":"%IW0"}
{"name":"iSetpoint","valueAddress":"%IW1"}
```

**Name prefix is required:** the first character of `name` selects the data type
(`i` Integer, `w` Word, `u` Unsigned, `b` Boolean, …). A name like `temperature`
(without prefix) is skipped → Debug shows `[]`.

1. Edit / add lines (`name` with type prefix + `valueAddress`).
2. Point **Modbus-IO-Config** at that file (relative `extras/…` → package root).
3. On **Modbus-Read** / Getter / Flex-Getter: **Use IO File** + **IO's As Payload**.
4. On **Response-Filter**: Filter = exact name (e.g. `iTemperature`), **Registers = 0**.

Address cheatsheet: `%IW*` Holding words (FC3), `%QW*` Input words (FC4),
`%IX*` / `%QX*` bits. Optional `addressOffset` on IO-Config shifts all mappings.

Larger sample: [`learning-device.json`](../extras/ioFileData/learning-device.json).
In Node-RED, open the **comment** nodes on example tab **11** — they explain
features, every flag, and how to add your own names.

Related: [`extras/ioFileData/`](../extras/ioFileData/).

---

## 6. What the in-package server is (and is not)

`modbus-server` is a **buffer-backed Modbus TCP slave** for demos, tests, and simple edge caches. You can inject into holding/coils/input/discrete buffers and mirror activity on five outputs.

It does **not** let the flow craft a protocol response per inbound request (no dynamic gateway). That design is tracked as a **separate package** recommendation — see [Issue #567](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/567) and example **15**.

---

## 7. Maintainer / contributor docs

Internal P4NR specs (not required for end users):

- [`p4nr/capabilities/examples-learning-path.md`](p4nr/capabilities/examples-learning-path.md)
- [`p4nr/capabilities/modbus-dynamic-server-gateway.md`](p4nr/capabilities/modbus-dynamic-server-gateway.md)
- [`p4nr/README.md`](p4nr/README.md)
