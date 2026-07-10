# P4NR Agent Pipeline — node-red-contrib-modbus v6 (closed)

This directory holds the **3-team agent workflow** for structured development of
**`@plus4nodered/node-red-contrib-modbus` v6** — the closed, next-major line with
**Modbus TLS**, scoped package name, and split server package.

## Repository Matrix

| | **v5 OSS** | **v6 closed (this repo)** |
|---|-----------|---------------------------|
| Path | `BIANCO-ROYAL/node-red-contrib-modbus` | `P4NR/modbus/node-red-contrib-modbus` |
| Package | `node-red-contrib-modbus` | `@plus4nodered/node-red-contrib-modbus` |
| Version | `5.x` (e.g. 5.45.2) | `6.0.0-beta.x` |
| Visibility | Open Source (GitHub) | `private: true` |
| TLS | — | `Modbus-Client-TLS` |
| Server | In-package (`Modbus-Server`) | Separate `@plus4nodered/node-red-contrib-modbus-server` |
| Logging | `debug` | `winston` |
| Agent team | `.cursor/agents/p4nr-*` in v5 repo | `.cursor/agents/p4nr-*` in this repo |

Use **v5** for public OSS contributions and LTS maintenance.
Use **v6** for TLS, architectural changes, and the next major release line.

## Teams

| # | Role | Cursor Agent | Output |
|---|------|--------------|--------|
| 1 | Spec Author | `p4nr-spec-author` | `capabilities/`, `plans/` |
| 2 | Spec Reviewer | `p4nr-spec-reviewer` | `reviews/` |
| 3 | Developer | `p4nr-developer` | `src/`, `test/` |

## Directory Layout

```
docs/p4nr/
├── README.md                 ← this file
├── capabilities/
│   └── <feature>.md          ← Team 1: what & why (capability contract)
├── plans/
│   └── <feature>.plan.md     ← Team 1: how (task_list with file paths)
└── reviews/
    └── <feature>.review.md   ← Team 2: APPROVE | REJECT
```

Use the same `<feature>` kebab-case slug across all three files.

## Quick Start

### New feature

1. **Team 1** — In Cursor, invoke `@p4nr-spec-author`:
   ```
   Spec für: [beschreibung]
   ```
2. **Team 2** — Invoke `@p4nr-spec-reviewer`:
   ```
   Review docs/p4nr/capabilities/<feature>.md und docs/p4nr/plans/<feature>.plan.md
   ```
3. **GATE 1** — You approve when verdict is APPROVE
4. **Team 3** — Invoke `@p4nr-developer`:
   ```
   Implementiere docs/p4nr/plans/<feature>.plan.md (Review: APPROVE)
   ```
5. **GATE 2** — You approve commit

### Bug fix (fast path)

Invoke `@p4nr-developer` directly with explicit approval:

```
orch-fix-defect: [bug description]
Regression test first, dann fix. Kein Spec nötig — trivialer Fix.
```

## Gates

- **GATE 1** — No implementation until `reviews/*.review.md` says **APPROVE** and you confirm
- **GATE 2** — No commit until you review diff + test results

## Supporting Files

- Pipeline rule: `.cursor/rules/p4nr-dev-pipeline.mdc`
- Node-RED patterns: `.cursor/skills/node-red-contrib-patterns/SKILL.md`
- Project context: `CLAUDE.md`
