# Migration notes — old order → new order

**Purpose:** Prudent trail when agent workflow, documentation SoT, enforcement, or program structure **changes**. Append rows; do not delete history — mark `status: complete` when verified.

**Related:** [macro-expectations.md](./macro-expectations.md) §6 · [06-documentation-strategy.md](./06-documentation-strategy.md) · [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md)

## How to add a row

| Field | Required |
| --- | --- |
| `id` | `MIG-YYYY-MM-DD-NN` |
| `area` | e.g. agent-workflow, docs-sot, ci, cursor-rules, package-api |
| `old_order` | What people/agents did before |
| `new_order` | What they do after redesign |
| `audience` | maintainers \| consumers \| agents \| all |
| `compat` | breaking \| deprecate-then-remove \| docs-only \| additive |
| `rollback` | How to revert safely (one paragraph) |
| `verify` | Commands or checks that prove migration landed |
| `status` | planned \| in_progress \| complete \| waived |
| `tasks` | `STAB-*` / PR refs |

---

## Register

### MIG-2026-10-23-01 — Program hub replaces monolithic redesign README

| Field | Value |
| --- | --- |
| **area** | program structure |
| **old_order** | Single long README as the only program artifact; plans lived in chat |
| **new_order** | [README.md](./README.md) hub + numbered deliverables + [tasks.yaml](./tasks.yaml) + [roadmap.md](./roadmap.md) |
| **audience** | maintainers, agents |
| **compat** | additive — no library API change |
| **rollback** | Revert `redesign/` folder; library unaffected |
| **verify** | Human can start from README and find active phase + next task without chat |
| **status** | in_progress |
| **tasks** | — |

### MIG-2026-10-23-02 — Canonical agent workflow (target)

| Field | Value |
| --- | --- |
| **area** | agent-workflow |
| **old_order** | Overlapping instructions: `.cursor/rules/*`, AGENTS.md, many skills, ad-hoc `_ai-docs/` |
| **new_order** | [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md) as single state machine; rules/skills **converge** via approved STAB tasks; cross-cutting facts in one `knowledge/<topic>.md` |
| **audience** | agents, maintainers |
| **compat** | deprecate-then-remove — trim duplicate prose after enforcement phase |
| **rollback** | Keep old rules until migration row verified; do not delete cursor rules without STAB task |
| **verify** | `pnpm knowledge:check`; optional future `check-skill-sources`; conflicts empty in [07-ai-workflow-audit.md](./07-ai-workflow-audit.md) |
| **status** | planned |
| **tasks** | STAB-AI-1, STAB-AI-2, STAB-AI-3, STAB-AI-4 |

### MIG-2026-10-23-03 — Drizzle proof vs “Drizzle default” prose (target)

| Field | Value |
| --- | --- |
| **area** | reliability / docs |
| **old_order** | Skills and docs state Drizzle-first; many packages lack integration tests; memory stores on main export |
| **new_order** | [05-engineering-standards.md](./05-engineering-standards.md) + `/testing` exports + `STAB-INT-*` prove stores in CI |
| **audience** | integrators, agents |
| **compat** | additive tests first; memory export moves may be breaking — changesets per package |
| **rollback** | Revert integration tests; restore exports if needed (document in row) |
| **verify** | `pnpm eristack check --profile integration`; F-001–F-003 closed |
| **status** | planned |
| **tasks** | STAB-INT-HCL, STAB-INT-DATAGRID, STAB-INT-VAL, STAB-MEM-1 |

### MIG-2026-10-23-04 — New AI workflow (efficiency + migration) — placeholder

| Field | Value |
| --- | --- |
| **area** | agent-workflow / tooling |
| **old_order** | `recommend`/`loadPlan` + scattered rules; optional `@eristack/ai-workflow` in consumer repos only |
| **new_order** | *To be defined when approved:* e.g. tightened `loadPlan`, fewer skill sources, eristack plan/check as mandatory entry; explicit mapping from old load commands to new |
| **audience** | all |
| **compat** | TBD — must include compat window and recipe/skill redirects |
| **rollback** | TBD |
| **verify** | TBD — likely `pnpm knowledge:check` + recommend tests + debottleneck |
| **status** | planned |
| **tasks** | *Add STAB-AI-* when scoped* |

*Fill MIG-2026-10-23-04 when the “better and more efficient” workflow is specified (see `notes/main.md` reminder).*

---

## Superseded instruction sources (watch list)

When a migration completes, move the old source here with **superseded_by** link.

| Old source | Superseded by (target) | Status |
| --- | --- | --- |
| Per-package upgrade doc chains | `#upgrading-eristack` only | partial — rule exists, stubs remain |
| Large embed in recommend-eristack skill | Generated catalog + thin skill | planned (STAB-AI-3) |
| Memory store from package root export | `@eristack/*/testing` | planned (STAB-MEM-*) |
