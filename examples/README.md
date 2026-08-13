# Examples — Learning Path

Import these flows from Node-RED:

**Menu → Import → Examples → node-red-contrib-modbus**

(or copy JSON from this folder). Work through **01 → 18** if you are new to Modbus or this package.

| Guide | Link |
|-------|------|
| **Full learning guide** (stages, cheat sheet, node map) | [`docs/LEARNING-PATH.md`](../docs/LEARNING-PATH.md) |
| Docs hub | [`docs/README.md`](../docs/README.md) |
| P4NR capability (maintainers) | [`docs/p4nr/capabilities/examples-learning-path.md`](../docs/p4nr/capabilities/examples-learning-path.md) |

Also linked from the package [README — How to use / Learning Path](../README.md#how-to-use--learning-path).

## Design notes (examples)

- **Flow-scoped config:** each `modbus-client` (and `modbus-io-config` in example 11) has `"z"` set to the example tab, so deleting the tab removes the client/config with the flow (no orphaned global configs).
- **One Modbus-Response per data source:** read/write/getter outputs do not share a single response node — status stays readable (poll intervals in demos are typically ≥ 1 s).
- **In-flow teaching:** every tab has a **comment** (and tab **info**) with three blocks:
  **FEATURES IN THIS FLOW**, **WHAT THE CONFIG DOES**, **HOW TO RUN**.
  Open the comment node (or the tab description) — that is the lesson for the flow.
  Example **11** adds extra comments for *how to add names* and Read/Filter flags.
- **SEE: Debug nodes:** each data-producing node wires to an active Debug named `SEE: …`
  so the Debug sidebar shows the payload the guide describes (arrays, named IO objects, etc.).


## Curriculum

| File | Purpose |
|------|---------|
| [`01-Modbus-Basics-Registers-And-FCs.json`](01-Modbus-Basics-Registers-And-FCs.json) | Coils / registers / FC1–16 concepts + local write/read |
| [`02-Getting-Started-Client-And-Server.json`](02-Getting-Started-Client-And-Server.json) | First TCP client + server + poll |
| [`03-Node-Read-Polling.json`](03-Node-Read-Polling.json) | **Modbus-Read** interval polling |
| [`04-Node-Getter-On-Demand.json`](04-Node-Getter-On-Demand.json) | **Modbus-Getter** trigger-based read |
| [`05-Node-Flex-Getter-Dynamic.json`](05-Node-Flex-Getter-Dynamic.json) | **Modbus-Flex-Getter** payload-driven FC |
| [`06-Node-Write-And-Flex-Write.json`](06-Node-Write-And-Flex-Write.json) | **Write** / **Flex-Write** (scalar vs array) |
| [`07-Node-Flex-Sequencer.json`](07-Node-Flex-Sequencer.json) | **Modbus-Flex-Sequencer** |
| [`08-Node-Flex-FC-Custom-Maps.json`](08-Node-Flex-FC-Custom-Maps.json) | **Modbus-Flex-FC** + `extras/argumentMaps` |
| [`09-Node-Flex-Connector-Runtime-Switch.json`](09-Node-Flex-Connector-Runtime-Switch.json) | **Modbus-Flex-Connector** runtime TCP switch |
| [`10-Node-Queue-Info-And-Multi-Device.json`](10-Node-Queue-Info-And-Multi-Device.json) | **Modbus-Queue-Info** + burst reads |
| [`11-Node-IO-Config-And-Response-Filter.json`](11-Node-IO-Config-And-Response-Filter.json) | **Named values**: IO-Config + Response-Filter |
| [`12-Node-Server-Buffer-Slave.json`](12-Node-Server-Buffer-Slave.json) | **Modbus-Server** buffer inject |
| [`13-Pattern-HTTP-To-Modbus.json`](13-Pattern-HTTP-To-Modbus.json) | HTTP → Modbus bridge pattern |
| [`14-Pattern-Serial-RTU-Client.json`](14-Pattern-Serial-RTU-Client.json) | Serial RTU client (needs hardware) |
| [`15-Pattern-Gateway-With-Buffer-Server.json`](15-Pattern-Gateway-With-Buffer-Server.json) | Buffer “cache slave” today; pointer to #567 dynamic gateway |
| [`16-Bugfix-Shared-Client-Disable-Isolation.json`](16-Bugfix-Shared-Client-Disable-Isolation.json) | **#423**: disable one Flex-Getter — sibling on same client must stay up |
| [`17-Node-Coils-Discrete-And-Bit-Writes.json`](17-Node-Coils-Discrete-And-Bit-Writes.json) | **FC2** Discrete read + **FC5/FC15** coil writes |
| [`18-Pattern-Ops-Timeout-And-Reconnect.json`](18-Pattern-Ops-Timeout-And-Reconnect.json) | Ops: logs + timeout/reconnect with local server disturb |

## Demo TCP ports

Import **one learning flow at a time**, or ensure these ports stay unique:

| Flow | Port(s) |
|------|---------|
| 01 | 10502 |
| 02 | 10503 |
| 03 | 10504 |
| 04 | 10505 |
| 05 | 10506 |
| 06 | 10507 |
| 07 | 10508 |
| 08 | 10509 |
| 09 | 10510 / 10511 |
| 10 | 10512 |
| 11 | 10513 |
| 12 | 10514 |
| 13 | 10515 |
| 14 | serial only |
| 15 | 10516 |
| 16 | 10517 |
| 17 | 10518 |
| 18 | 10519 |

## IO file (example 11) — how to maintain names

**Starter file (used by the example):**

```text
extras/ioFileData/names-starter.json
```

Each line is one named mapping (NDJSON):

```json
{"name":"iTemperature","valueAddress":"%IW0"}
{"name":"iSetpoint","valueAddress":"%IW1"}
```

| Field | Meaning |
|-------|---------|
| `name` | Filter key **and** type hint: **first character must be the data type** (`i` Integer, `w` Word, `u` Unsigned, `b` Boolean, `f`/`r` Float, …). Without it mappings are skipped → empty `[]`. |
| `valueAddress` | CODESYS-style address (`%IW0` Holding word → FC3, `%QW0` Input word → FC4, `%IX0.0` / `%QX0.0` bits) |

**In the flow:** Modbus-Read → enable **Use IO File** + **IO's As Payload**.
Response-Filter → **Filter** = exact `name` (e.g. `iTemperature`), **Registers** = `0`.

Relative `extras/…` paths resolve to the package root. Larger PLC dump:
`extras/ioFileData/learning-device.json`. Open the comment nodes on tab **11** for the full howto.

## Old → new mapping

| Former example | Replaced by |
|----------------|-------------|
| Simple-Modbus-Demo / Flex-Suite | 01–07, 10, 12 (split; no flex-server) |
| Modbus-Sequnecer-Demo | 07 |
| Modbus-Flex-FC | 08 |
| modbus-switch-tcp | 09 |
| Simple-Modbus-IO-Demo / CODESYS-CSV-To-IO | 11 (+ `extras/ioFileData`) |
| Modbus-HTTP | 13 |
| Modbus-Buffer-Server / Modbus-Slave | 12, 15 |
| Modbus-Read-Write-Servers / Multiple-Dynamic-… | 03, 05, 06, 10 |

## Related docs

- Dynamic flow-based TCP server / gateway (**not** in this package): [GitHub #567](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/567), draft capability [`modbus-dynamic-server-gateway.md`](../docs/p4nr/capabilities/modbus-dynamic-server-gateway.md)
- Flex-FC maps: [`extras/argumentMaps/`](../extras/argumentMaps/)
