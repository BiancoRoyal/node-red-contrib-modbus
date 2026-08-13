# Capability Spec: Client Timeout / Reconnect Recovery (#569 regression on 5.60.1)

**Spec ID:** `client-timeout-reconnect-recovery`  
**Version:** v5 OSS LTS (`node-red-contrib-modbus` 5.x)  
**Status:** READY FOR REVIEW  
**Author:** p4nr-spec-author (Team 1)  
**Date:** 2026-08-05  
**Related:** GitHub #569 (kungknut regression on 5.60.1), #564, parent `client-timeout-reconnect-honesty` (shipped 5.60.1)

---

## 1. Problem Statement

**5.60.1** shipped timeout/DNS reconnect honesty (`client-timeout-reconnect-honesty`).
Field feedback on **2026-08-03** (issue #569, kungknut):

> The problem is back with **5.60.1** under docker `nodered/node-red:5.0.1-24-minimal`
> / `5.0.4-24-minimal`. Earlier, **5.45.2 worked** on the same NR 5.0.1 + Node 24 stack.

Root cause is not a random re-break: the honesty path **forces** the visible
`failed → broken → reconnecting → init → connectClient` cycle and removed
Fake-Ready / in-band heal. That can look like the old *Initialized* ↔
*Reconnecting after N msec* flicker. Two concrete follow-up gaps remain:

| # | Gap | Evidence |
|---|-----|----------|
| 1 | **Double reconnect delay** — `reconnecting` waits `reconnectTimeout`, then non-first `init` waits again before `connectClient` | Code in `src/modbus-client.js`; GATE1 for 5.60.1 deferred collapsing this delay |
| 2 | **Post-connect Ready** — `connected` emits `mbconnected` but does not send `ACTIVATE`; readiness / queue drain depends on a later command completion | Status stays “connected” without `mbactive`; non-buffer / empty-queue edge cases |

### Internal repro (2026-08-05)

- Local + **Node 24** Docker (`node:24-bookworm-slim`, kungknut runtime family): hard TCP outage (server stop + transport drop), **no** artificial `BREAK`, **no** `connectClient` nudge.
- Result: FSM reaches `reconnecting`/`init`; after peer-up recovery **succeeds** without NR restart (~1.4s with `reconnectTimeout=2000` when peer returns mid-init wait).
- Existing E2E `recoverClient` **nudges** `connectClient` while in `init`, which can mask field-like delay/ready gaps — tests MUST cover recovery **without** nudge.

---

## 2. Goals

1. Keep honesty (no Fake-Ready, no in-band `connectClient`) from 5.60.1.
2. After peer is reachable again, recover to `connected`/`activated` with **one**
   intentional `reconnectTimeout` wait (FR-FSM-06), not two stacked waits.
3. On successful connect, enter Ready (`ACTIVATE`) so queue/read paths do not
   depend on a prior in-flight command completing.
4. Ship as patch **5.60.2** with Mocha coverage and CHANGELOG citing #569.

---

## 3. Scope

### In-scope

| Area | Change |
|------|--------|
| `src/modbus-client.js` | Single reconnect delay after `reconnecting`; `ACTIVATE` on `connected`; optional reconnect attempt counter for status/log |
| `src/modbus-basics.js` / read status (minimal) | Status text for retry attempts when available |
| `test/units/`, `test/e2e/` | Fake-timer delay; post-connect ACTIVATE; no-nudge recovery; half-open still FSM-only |
| CHANGELOG / version | **5.60.2** |

### Out-of-scope

- #577 Serial segfault / nested `serialport@10` under `@openp4nr/modbus-serial`
- Re-introducing Fake-Ready (`ACTIVATE` from `broken`) or in-band `connectClient`
- Changing default `reconnectTimeout` / `clientTimeout` palette defaults
- Queue preserve across outage (keep wipe + `cberr`)

---

## 4. Functional Requirements

### FR-TMR-SINGLE — One wait per reconnect cycle

When `reconnectOnTimeout === true` and the machine enters `reconnecting`, it
MUST wait `reconnectTimeout` once, then transition to `init`.

When `init` is entered **from `reconnecting`**, the client MUST call
`connectClient` **without** a second full `reconnectTimeout` delay
(synchronous call or next-tick is allowed for stack unwind).

Non-first `init` from other paths (e.g. `broken → INIT` when
`reconnectOnTimeout === false`) MAY still delay by `reconnectTimeout`.

First-ever connection (`isFirstInitOfConnection`) keeps the existing short
serial connection delay behaviour.

FR-FSM-06 (sequential retries while peer down) remains: failed connect →
FAILURE → … → `reconnecting` again with another single wait.

### FR-CONN-READY — ACTIVATE after successful CONNECT

When the FSM enters `connected` after a successful transport open
(`CONNECT` from TCP or serial open path), the client MUST send `ACTIVATE`
(via `sendActivateIfAllowed` or equivalent) so the machine reaches `activated`
without waiting for a command completion callback.

This MUST NOT weaken FR-FSM-ACT: `ACTIVATE` remains forbidden from
`broken` / `reconnecting` / `init` / `failed`.

### FR-HALF-OPEN — Unchanged honesty

Half-open `!readable` sockets MUST still fail into FSM recovery (`FAILURE` /
network errno mapping) and MUST NOT call `connectClient` from read/write/custom.

After a successful reconnect cycle, buffered commands that survive (or new
commands after wipe) MUST be drainable again (`QUEUE` / #574 re-arm unchanged).

### FR-STATUS-RETRY — Visible retry honesty

The client SHOULD expose a reconnect attempt counter (reset on successful
`connected`) for state log / node status so operators can distinguish
“retrying (attempt N)” from a true hard stop. Exact wording may be concise;
must not imply Fake-Ready.

---

## 5. Watchpoints (MUST NOT break)

| Watchpoint | Spec / Issue |
|------------|--------------|
| No Fake-Ready / no in-band connect | FR-FSM-ACT, FR-FSM-CONN (honesty) |
| Timeout / DNS still drive FAILURE | FR-TO-01 / FR-TO-02 |
| INIT wipe notifies pending | FR-Q-WIPE |
| Sequential drain re-arm | #574 |
| Shared-client deregister isolation | #423 / #487 |

---

## 6. Non-Functional

- Patch **5.60.2** on `support/v5.60` — backwards compatible API/options.
- Mocha + `node-red-node-test-helper` only.
- CHANGELOG cites #569 (and #564 as related honesty parent).

---

## 7. Acceptance Criteria

| ID | Criterion |
|----|-----------|
| AC-01 | Unit (fake timers): `broken → RECONNECT → reconnecting` waits `reconnectTimeout` once; next `init` schedules `connectClient` with **0** additional delay when previous state was `reconnecting` |
| AC-02 | Unit: entering `connected` results in `activated` (ACTIVATE sent) without a prior command `finally` |
| AC-03 | Unit: late ACTIVATE while `broken`/`reconnecting` still does not Fake-Ready |
| AC-04 | Unit: half-open read path does not call `connectClient`; sends recoverable error into FSM |
| AC-05 | E2E: hard TCP outage → peer up → Modbus roundtrip **without** `connectClient` nudge helper |
| AC-06 | Existing honesty + #574 tests remain green; `npm run build` + targeted suites pass |
| AC-07 | CHANGELOG / package **5.60.2** document the recovery UX fix |

---

## 8. Issue mapping

| Issue | Role |
|-------|------|
| #569 | Primary — regression report on 5.60.1 (kungknut Docker NR5/Node24) |
| #564 | Parent honesty / DNS stall cluster |
| #574 | Regression guard |
| #577 | Out of scope |

---

## 9. Risks

| Risk | Mitigation |
|------|------------|
| Faster reconnect churn when peer down | Still one full `reconnectTimeout` per cycle; document |
| ACTIVATE on every `connected` races CLOSE | `sendActivateIfAllowed` only while state is `connected`; existing CLOSE/BREAK edges remain |
| E2E flakiness without nudge | Longer recover wait; assert trail includes reconnect + connected/activated |
