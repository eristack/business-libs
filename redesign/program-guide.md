# Program guide — incremental execution

## Phases (dependency order)

| Phase | Goal | Exit criterion |
| --- | --- | --- |
| **0 — Discover** | Evidence inventories & findings register | [02-inventory.md](./02-inventory.md) + [03-findings-register.md](./03-findings-register.md) reviewed by human |
| **1 — Align** | Single SoT for agent workflow + doc policy | [07](./07-ai-workflow-audit.md) + [08](./08-canonical-agent-workflow.md) approved; conflict list empty or waived |
| **2 — Enforce baseline** | Mechanical gates match written rules | [10-enforcement-design.md](./10-enforcement-design.md) implemented in CI/scripts (authorized tasks only) |
| **3 — Prove production paths** | Drizzle/integration tests for spine packages | Tasks `STAB-INT-*` green in CI |
| **4 — Maturity** | Package maturity dashboard + debottleneck policy | Optional; after phase 3 |

Phases are **not calendar-bound**. Start phase N+1 only when phase N exit criteria are met or explicitly waived in `tasks.yaml` (`waived_by`, `reason`).

## Task lifecycle (canonical)

```text
proposed → approved → in_progress → review → verified → closed
                    ↘ blocked
                    ↘ deferred
```

| State | Meaning | Evidence |
| --- | --- | --- |
| `proposed` | Draft in `tasks.yaml` | Finding link |
| `approved` | Human OK to touch repo | Name in task |
| `in_progress` | Agent/human implementing | Branch/work |
| `review` | PR open | PR link (human) |
| `verified` | Acceptance commands green | Log snippet in task notes |
| `closed` | Merged + no follow-up | — |

**Agents:** may implement only **`approved`** tasks. Assessment/docs under `redesign/` may always be updated.

## Handoff packet (context loss)

When stopping mid-initiative, append to the active task in `tasks.yaml`:

- `last_command` — e.g. `pnpm eristack ci --base origin/main`
- `last_result` — pass/fail summary
- `next_action` — one imperative sentence
- `files_touched` — paths (no secrets)

Optional: use `@eristack/ai-workflow` MCP in consumer repos; in **business-libs**, prefer `redesign/tasks.yaml` + ticket files.

## Relationship to existing workflows

| Mechanism | Use for stabilization program |
| --- | --- |
| `_ai-docs/wip/<topic>/` | **Implementation** scratch → promote to package docs; not for program meta |
| `tickets/*.md` | Consumer/maintainer **bugs/suggestions**; link from findings |
| `tickets/triage.yaml` | Maintainer ordering; optional rank for STAB tasks |
| `@eristack/ai-ticket-generator` | New external reports |
| `.cursor/rules/*.mdc` | **Enforcement targets** — change only via approved STAB tasks |
| `pnpm eristack check` | **Verification** — cite profile in acceptance |

## Incremental rule

One **reviewable** unit per PR where possible:

- One package test gap, one CI gate, one canonical doc merge, or one workflow consolidation — not “fix all docs.”

Match repo norm: **≤3 files** for agent integration tasks ([`agent-workflow.md`](../packages/ai/ai-knowledge/knowledge/agent-workflow.md) design targets).
