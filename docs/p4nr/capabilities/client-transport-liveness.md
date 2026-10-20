# Capability Spec: Client Transport Liveness and Reconnect Stability

**Spec ID:** `client-transport-liveness`
**Version:** v5 OSS (`node-red-contrib-modbus` 5.x) — intended for **5.61.0**
**Status:** RELEASED in 5.61.0
**Date:** 2026-10-20
**Related:** #580 (one absent PLC disturbs the healthy peer on a shared gateway), #586, #564 (communication stops without an error),
#569; builds on `client-timeout-reconnect-semantics` (5.60.3)

---

## 1. Problem

`client-timeout-reconnect-semantics` lets the user switch timeout recovery off with **Reconnect on timeout**. The
default is **on**, and with it one absent Unit ID on a shared Modbus connection still rebuilds the connection for
every Unit ID behind it (#580). Three further weaknesses show up in the field:

- A request that outlives a connection rebuild reports to a client that is no longer current; its late error or
  its port `close` event drives the FSM of the *new* connection (flapping).
- A TCP connection that drops while idle is not noticed until the next command fails (#564: "stops without any
  error"). Only the serial port had a `close` listener.
- Reconnect attempts run at a fixed delay, so many clients hit a returning gateway at the same moment.

## 2. Requirements

| ID | Requirement |
|----|-------------|
| FR-LIVE-01 | Transport **proof of life** = a successful response from any Unit ID, a Modbus exception response (`err.modbusCode`), or the connect itself (FSM `connected`). It is stored as `node.lastAliveAt` on a monotonic clock (`performance.now()`), so wall clock steps (NTP, RTC set at boot) do not move the window. A write to Unit ID 0 whose error is swallowed (broadcast, no reply) is **no** proof of life. |
| FR-LIVE-02 | With `reconnectOnTimeout=true` an **application timeout** (`isApplicationTimeoutError`) sends `FAILURE` only when the last proof of life is older than the **liveness window**: `livenessWindow = max(10 s, 4 × clientTimeout)` (`node.livenessWindowMs` overrides it for tests). Otherwise the command fails alone. |
| FR-LIVE-03 | Transport errors (`code`/`syscall`, `ECONNRESET`, DNS, `Port Not Open`, …) always recover, regardless of proof of life. |
| FR-LIVE-04 | `reconnectOnTimeout=false` is unchanged: an application timeout never rebuilds the connection. |
| FR-ISO-01 | `modbusErrorHandling(err, sourceClient)` ignores failures of a client that is no longer `node.client`; the client `error` handler, the port `close` handler and the connect `then`/`catch` (`forCurrentClient`) are bound to the instance they were created for. A late successful connect of a replaced client is closed again. |
| FR-IDLE-01 | After a TCP connect the node watches the port `close` event (same `watchPortClose` as serial). A drop while idle enters the normal `CLOSE → RECONNECT` path without waiting for a command. |
| FR-BACKOFF-01 | Reconnect delay: the configured `reconnectTimeout` for attempts 1–3, then doubling (attempt 4: ×2, 5: ×4, …) capped at 30 s, with ±10 % jitter around the capped value (27–33 s at the cap), never below the configured value. `reconnectAttempt` resets on `connected` and on a dynamic reconnect to a new target. The node status shows the actual delay (`node.reconnectDelay`). |

## 3. Behaviour changes users can notice

- One absent Unit ID on a shared connection no longer interrupts healthy Unit IDs, **also with the default setting**.
- A single device that stops answering is recognised after the liveness window (≥ 10 s after its last response or
  the connect) instead of at the first timeout. A dead half-open TCP connection therefore heals up to 10 s later
  than before; a closed socket, reset or DNS failure still recovers immediately.
- A long outage no longer retries every `reconnectTimeout`; from the fourth attempt on the delay grows to about 30 s
  (±10 % jitter). Recovery after a short blip is unchanged (first three attempts at the configured delay). This also
  applies with `reconnectOnTimeout=false` (`broken → init`).
- TCP connections that drop while idle now show `closed` / `retrying…` right away.

## 4. Non-goals

- No new editor fields: the window and backoff constants are internal. Expose them only when a field case needs it.
- No change to how Modbus exception responses are reported to flows.
- Serial adapters that disappear are still reported by the port (`Port Not Open` / close), not by timeouts.

## 5. Tests

| Level | File | Covers |
|-------|------|--------|
| Unit | `test/units/modbus-client-core-test.js` | `computeReconnectDelay` table, `livenessWindow`, `shouldEscalateTimeout`, `markAlive`, `isDeviceAnswerError`, `describeError` |
| Unit | `test/units/modbus-client-test.js` | FR-LIVE-02/03, FR-ISO-01 (`modbusErrorHandling`, `handleClientError`, `watchPortClose`), `nextReconnectDelay`, `nextInitDelay` |
| E2E | `test/e2e/modbus-client-timeout-semantics-e2e-test.js` | default flag: absent Unit 101 does not rebuild while Unit 103 answers; rebuild after the liveness window; idle TCP drop recovers with both flag values |

The E2E cases fail on the 5.60.3 code (`mbbroken, mbinit` after an absent-unit timeout; no `mbreconnecting` after an
idle drop) and pass here.

## 6. Risks

| Risk | Mitigation |
|------|------------|
| A genuinely dead single device keeps a half-open connection for up to the liveness window | Window is bounded (≥ 10 s, 4 × timeout); socket-level failures bypass it (FR-LIVE-03) |
| `close` of a rebuilt client re-enters the FSM | Handlers compare the instance with `node.client` (FR-ISO-01) |
| Backoff delays recovery after a longer outage | First three attempts unchanged; cap 30 s; jitter only from attempt 4 |
