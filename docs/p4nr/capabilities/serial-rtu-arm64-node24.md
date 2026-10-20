# Capability Spec (DRAFT follow-up): Serial RTU ARM64 / Node 24 segfault (#577)

**Spec ID:** `serial-rtu-arm64-node24`  
**Version:** v5 OSS LTS (`node-red-contrib-modbus` 5.x)  
**Status:** DRAFT — not part of 5.60.3  
**Author:** p4nr-spec-author (Team 1)  
**Date:** 2026-07-30 (expanded 2026-10-20)  
**Related:** GitHub [#577](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/577) (Segmentation fault when opening Serial RTU in Node-RED Docker on ARM64 with Node.js 24); adjacent [#585](https://github.com/BiancoRoyal/node-red-contrib-modbus/issues/585) (Node 26 serial latency)

---

## 1. Problem Statement

Opening Modbus Serial RTU in Node-RED Docker on **ARM64** with **Node.js 24**
can segfault. Suspected stack: `serialport` / `@serialport/*` native bindings
(v5.60.0 bumped serialport 12 → 13) and/or `@openp4nr/modbus-serial` on that
platform matrix.

This is a **platform/native dependency** issue, not the TCP timeout/reconnect
FSM work tracked in `client-timeout-reconnect-honesty` / `-recovery` /
`-semantics`.

Field reports also show **Node.js 26** serial ~1 s delays leading to Queue full
(#585). That is upstream `@serialport/bindings-cpp` behaviour — document only
in v5; do not fork C++ bindings in this package.

---

## 2. Goals (when promoted to READY FOR REVIEW)

1. Reproduce on CI or documented ARM64 Docker matrix (Node 20 LTS vs 22 vs 24 vs 26).
2. Identify crashing native module and pin/upgrade/workaround.
3. Document supported Serial matrices in README/HISTORY/CHANGELOG (partially done in 5.60.3 docs).
4. Avoid conflating with TCP client reconnect patches.
5. Decide v5 workaround vs v6/`@openp4nr/modbus-serial` major — no silent openp4nr major in v5 without explicit decision.

---

## 3. Out of scope for sibling patches 5.60.1–5.60.3

| Release | Scope |
|---------|--------|
| 5.60.1 | Timeout/DNS honesty FSM |
| 5.60.2 | Post-connect Ready / single reconnect delay |
| 5.60.3 | `reconnectOnTimeout=false` semantics, Keep Msg Properties, server close |

All of the above remain separate from #577 native segfault work.

---

## 4. Known matrix (working draft)

| Runtime | Arch | Serial RTU | Notes |
|---------|------|------------|-------|
| Node 22 | x64 | Supported | Primary CI / maintainer path |
| Node 24 | x64 | Supported | Primary LTS evaluation |
| Node 24 | ARM64 (Docker) | **Segfault risk (#577)** | Nested/native `serialport` bindings |
| Node 26 | any | **Known risk (#585)** | ~1 s delays / Queue full; upstream bindings-cpp |

TCP Modbus is unaffected by these serial binding issues.

---

## 5. Hypotheses (to validate)

1. Nested `serialport@10` under `@openp4nr/modbus-serial@8.4.0` on ARM64/Node 24.
2. `@serialport/bindings-cpp` build mismatch for Node ABI on ARM64 images.
3. Image lacks build tools / prebuilds for the binding.

---

## 6. Next steps

1. Collect #577 environment: image tag, arch, `npm ls serialport`, stack trace / core dump.
2. ARM64 Docker repro matrix (Node 22 vs 24; with/without rebuild).
3. Expand this draft into full FR/AC + plan after reproduction.
4. Team 2 GATE 1 only after READY FOR REVIEW.
5. Prefer fix in `@openp4nr/modbus-serial` or documented rebuild steps over a fragile package-level override in v5.

---

## 7. Non-goals (v5)

- Claiming Node 26 Serial support
- Forking `@serialport/bindings-cpp` in this repo
- Fake-Ready / in-band `connectClient` workarounds for serial stalls
