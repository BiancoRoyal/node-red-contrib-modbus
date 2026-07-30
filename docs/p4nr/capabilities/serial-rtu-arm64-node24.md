# Capability Spec (DRAFT follow-up): Serial RTU ARM64 / Node 24 segfault (#577)

**Spec ID:** `serial-rtu-arm64-node24`  
**Version:** v5 OSS LTS (`node-red-contrib-modbus` 5.x)  
**Status:** DRAFT — not part of 5.60.1  
**Author:** p4nr-spec-author (Team 1)  
**Date:** 2026-07-30  
**Related:** GitHub #577 (Segmentation fault when opening Serial RTU in Node-RED Docker on ARM64 with Node.js 24)

---

## 1. Problem Statement

Opening Modbus Serial RTU in Node-RED Docker on **ARM64** with **Node.js 24**
can segfault. Suspected stack: `serialport` / `@serialport/*` native bindings
(v5.60.0 bumped serialport 12 → 13) and/or `@openp4nr/modbus-serial` on that
platform matrix.

This is a **platform/native dependency** issue, not the TCP timeout/reconnect
FSM honesty tracked in `client-timeout-reconnect-honesty`.

---

## 2. Goals (when promoted to READY FOR REVIEW)

1. Reproduce on CI or documented ARM64 Docker matrix (Node 20 LTS vs 22 vs 24).
2. Identify crashing native module and pin/upgrade/workaround.
3. Document supported Serial matrices in README/CHANGELOG.
4. Avoid conflating with TCP client reconnect patches.

---

## 3. Out of scope for sibling patch 5.60.1

All FSM/timeout/DNS/queue-wipe work remains in
`client-timeout-reconnect-honesty` only.

---

## 4. Next steps

1. Collect #577 environment: image tag, arch, serialport versions, stack trace.
2. Expand this draft into full FR/AC + plan after reproduction.
3. Team 2 GATE 1 only after READY FOR REVIEW.
