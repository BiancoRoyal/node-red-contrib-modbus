# Curated Issue & Bug TODO (reviewed 2026-06-11)

This file is a *curated, actionable* companion to the maintainer brainstorm in
[`TODO.md`](TODO.md). It summarizes the **real, currently-open issues** of the
repository, groups recurring (recently auto-closed *Stale*) reports by root cause,
prioritizes the bugs worth fixing, and records the **Node-RED v4 vs v5 compatibility
test results** with a branching recommendation.

> Snapshot: package `node-red-contrib-modbus` v5.45.2. Only **4 issues are open**;
> most historical reports were auto-closed by the *Stale* bot after 90 days, which is
> **not** the same as being fixed. The groups below fold those stale-but-unresolved
> reports back into the active root causes.

---

## 0. Implementation status (2026-06-11)

One release was cut per *fixable* priority, with the minor version growing per fix.

| Prio | Status | Version | Notes |
|------|--------|---------|-------|
| **P2** unitId/unitid (#568) | ✅ **Fixed & verified** | **5.46.0** | `getActualUnitId()` accepts both spellings; `0` stays valid. Unit tests added; full suite `441 passing`. |
| **P1** reconnect/timeout FSM | ⚠️ **Not fixed (unsafe)** | — | See findings below. |
| **P3** serial/RTU | ⚠️ **Not fixed (not verifiable here)** | — | Needs real serial hardware / RTU slaves. |

### P1 — reproduction findings (why no blind fix was shipped)

Built two real harnesses (real `modbus-client` node + a controllable TCP/Modbus
stub) to reproduce the reported "node silently dies / cannot reconnect":

1. **ECONNRESET, `reconnectOnTimeout: true`** → FSM cycles
   `activated → reconnecting → init → …` and **recovers** when the server returns.
2. **Read timeout, socket kept open, `reconnectOnTimeout: true`** → **recovers**.
3. **ECONNRESET, `reconnectOnTimeout: false`** → **degraded/stuck** in `sending`
   (2 reads vs ~11 healthy); the dead socket is never rebuilt. This matches the
   "silent death" class (#553/#564/#549).

A targeted fix (reconnect on `broken` when the socket is provably `destroyed`,
keeping `reconnectOnTimeout` for live-socket timeouts) **did** repair case 3, but
**broke 8 existing tests** in `modbus-flex-getter` / `modbus-write` regardless of
how narrow the socket-dead check was. The FSM and its tests are too tightly
coupled to change the `broken`-handler safely without a dedicated FSM/test
refactor. Shipping it would risk exactly the regressions this package has suffered
from. **Recommendation:** treat P1 as an FSM-rework task (rebuild a reconnect
regression harness like the one above, decide `reconnectOnTimeout` semantics —
a broken connection should always reconnect — then refactor handler + tests
together), not a one-line patch.

### Release / publish mechanics

`.github/workflows/build.yml` publishes to npm automatically on **push to
`master`** (job `publish`, `JS-DevTools/npm-publish@v1` with `NPM_TOKEN`). The
agent prepared the release (version bump + CHANGELOG on the PR branch) but does
**not** publish or merge to `master`. To release 5.46.0: review/merge the PR into
`master`; GitHub Actions then runs `npm test` + publish. (`npm run release` /
`standard-version` is the alternative local tag-based flow.)

---

## 1. Open issues (live)

| # | Type | Title | Notes |
|---|------|-------|-------|
| [#569](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/569) | bug | `Error: Timed out at modbus-client-core.js:44` | Read/Getter stops after updating Node-RED to **4.1.10 / 4.1.11**; client stays "pending between *Initialized* and *Reconnecting after 2000msec*". 2 independent reporters. **Highest priority.** |
| [#568](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/568) | bug | `unitId` vs `unitid` inconsistency | `modbus-client` emits `msg.unitId`, but `getActualUnitId()` only reads `msg.payload.unitid`. Well-specified, low-risk fix proposed. |
| [#567](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/567) | feature | Flow-based Modbus TCP server (gateway/proxy) | Contributor offers a PR. Architecture decision needed (core vs separate package). |
| [#564](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/564) | bug | Modbus communication silently stops | Works for weeks, then halts with no error; only a manual client disable/enable recovers it. Same family as #553. |

---

## 2. Real bugs to fix, grouped by root cause (priority order)

### P1 — Connection / reconnect state machine gets stuck (dominant pain)
Symptom across many reports: after a timeout, TCP RST, or device exception the client
**never returns to a working state** without a manual re-deploy / disable-enable.
- Active: **#569**, **#564**
- Stale-but-unresolved (same family): #553 (silent death), #540 (Read broken after
  Node-RED 4.1.0), #549 (queue off → can't read multiple devices), #525 (fast read
  cycle blocks writes), #532 (crash on RST-TCP with server node), #536 (memory leak on
  exception 11 "Gateway Target Device Failed to Respond").
- Code area: `src/core/modbus-client-core.js` (client timeout handler + the
  `@xstate/fsm` state map: `reconnecting / failed / broken / closed` transitions) and
  the per-node "client ready to send" guard noted in `TODO.md`.
- **Action:** add a regression test that forces a client timeout/RST and asserts the
  FSM recovers to `activated` and resumes polling; then fix the stuck transition. The
  local TCP round-trip works (see §4), so reproduction needs an unresponsive/dropping
  server (e.g. a stub that accepts then stops answering).

### P2 — API/message consistency
- **#568** `unitId` vs `unitid`: make `getActualUnitId()` accept **both** spellings.
  Must not use `||` fallback because unit id `0` is a valid broadcast/address.
  `src/core/modbus-client-core.js:50`.
- #550 (stale) `Keep Msg Properties` not working anymore — verify against current
  `keepMsgProperties` handling.

### P3 — Serial / RTU robustness
- #560 (stale) RTU restarts in Docker, #544 (stale) failure on "State sending",
  #543 (stale) serial server segfault on IOTstack, #551 (closed/reverted) intermittent
  RTU slave failure after 5.45.1. Needs serial hardware or a simulator to validate.

### P4 — Packaging / release hygiene
- #554 (stale) npm vs GitHub version mismatch (5.45.3 vs 5.43.0) — align tags/release.
- #529 install fails under `--omit=dev` / production config.
- #523 (v6) `node-gyp-build` not found (native serial build on termux).

### Features / architecture (not bugs)
- #567 flow-based Modbus TCP server (decide: core vs separate package, mirroring the
  earlier `modbus-flex-server` split).
- #547 (stale) half-duplex RS-485 direction control.

---

## 3. Suggested next steps for maintainers
1. Reopen / de-stale the reports folded into **P1** and track them under one umbrella
   "reconnect recovery" issue; they are almost certainly one root cause.
2. Land the **#568** `unitId/unitid` fix first (cheap, isolated, testable).
3. Build a reconnect regression harness (timeout + RST stub server) before touching the
   FSM, then fix P1.
4. Add a Node-RED version axis to CI (see §4) so future host upgrades can't silently
   regress node loading.

---

## 4. Node-RED v4 vs v5 compatibility — test results

Tested the built package (from `src/` → `modbus/`) loaded into **two real Node-RED
hosts** on Node.js 22, each running the same flow: `modbus-server` (TCP) +
`modbus-client` + `modbus-flex-write` (FC16) + `modbus-read` round-trip.

| Node-RED | Nodes load | FC16 write `[1111,2222]` | Read-back over TCP | Errors |
|----------|:---------:|:-----------------------:|:------------------:|:------:|
| **4.1.11** (v4 latest) | ✅ all 13 types | ✅ | ✅ `[1111,2222]` | 0 |
| **5.0.0** (v5 latest)  | ✅ all 13 types | ✅ | ✅ `[1111,2222]` | 0 |

**Conclusion: the package is highly compatible with both Node-RED v4 and v5.**
Node loading, the editor (HTTP 200), and the full client/server data path behave
identically on both hosts.

### Branching recommendation
- **Do NOT create separate v4 / v5 branches.** A single contribution package supports
  both hosts; Node-RED's node API is stable across 4.x→5.x for these nodes. Keep the
  existing `develop → master` git-flow.
- The `#569` / `#540` "broke after Node-RED 4.1.x" reports are **not** a load/
  registration incompatibility (nodes load and run fine on 4.1.11 here). They are the
  **runtime reconnect/timeout bug (P1)** that surfaces against real/remote servers — fix
  it in the client logic, not via a host-version branch.
- Instead of branching, **add a Node-RED version matrix to CI** (`.github/workflows/build.yml`
  currently varies only Node.js 18/20/22). Suggested: also install/test against
  `node-red@4.1` and `node-red@5` to catch host regressions early. Keep
  `package.json` → `node-red.version: ">=3"`.
- Only revisit a split if a *future* Node-RED major introduces a breaking runtime API;
  even then prefer an `engines` / peer version range over parallel maintenance branches.
