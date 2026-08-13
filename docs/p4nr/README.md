# P4NR Agent Pipeline — node-red-contrib-modbus v5 (Open Source)

**Public LTS** — `node-red-contrib-modbus` v5.x on GitHub.

For **v6 closed (TLS)**, see `P4NR/modbus/node-red-contrib-modbus/docs/p4nr/README.md`.

## End-user documentation (not this folder)

| Doc | Link |
|-----|------|
| Learning Path | [`../LEARNING-PATH.md`](../LEARNING-PATH.md) |
| Docs hub | [`../README.md`](../README.md) |
| Examples index | [`../../examples/README.md`](../../examples/README.md) |
| Package README | [`../../README.md`](../../README.md) |

## Repository Matrix

| | **v5 OSS (this repo)** | **v6 closed** |
|---|------------------------|-----------------|
| Path | `BIANCO-ROYAL/node-red-contrib-modbus` | `P4NR/modbus/node-red-contrib-modbus` |
| Version | `5.x` | `6.0.0-beta.x` |
| Visibility | Open Source | `private: true` |
| TLS | — | yes |
| Server | in-package | separate pkg |

## Teams

| # | Agent | Output |
|---|-------|--------|
| 1 | `p4nr-spec-author` | `capabilities/`, `plans/` |
| 2 | `p4nr-spec-reviewer` | `reviews/` (APPROVE/REJECT) |
| 3 | `p4nr-developer` | `src/`, `test/` |

## Flow

```
Feature/Bug → Team 1 → Team 2 → GATE 1 → Team 3 → GATE 2 → PR/commit
```

## Active / recent capabilities (v5)

| Spec | Status |
|------|--------|
| `repo-quality-and-fsm-hardening` | shipped in 5.46.0 |
| `examples-learning-path` | GATE 1 APPROVE — examples 01–15 (package **5.50.0**) |
| `shared-client-deregister-isolation` | GATE 1 APPROVE — fix #423/#487 shared-client STOP |
| `queue-sequential-drain-rearm` | GATE 1 APPROVE — fix #574 Queue full / sequential drain |
| `live-node-red-feature-matrix` | GATE 1 APPROVE — live helper+Modbus-Server matrix |
| `client-timeout-reconnect-honesty` | shipped in **5.60.1** — #564/#569 timeout/DNS reconnect honesty |
| `client-timeout-reconnect-recovery` | GATE 1 APPROVE — #569 post-5.60.1 recovery UX (single delay + post-connect Ready; target **5.60.2**) |
| `serial-rtu-arm64-node24` | DRAFT follow-up — #577 segfault Serial RTU ARM64 Node 24 |

## OSS Notes

- Prefer non-breaking changes in v5
- CHANGELOG for user-visible work
- Community PRs: spec optional for trivial fixes if you explicitly waive GATE 1
