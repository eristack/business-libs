# Eristack stabilization & AI workflow redesign (program hub)

**Status:** Phase 0 — discovery drafts populated; **no remediation authorized** until a phase is explicitly approved in [roadmap.md](./roadmap.md).

This folder is the **only** place for stabilization-program planning. It does **not** replace:

| Authoritative today | Role |
| --- | --- |
| `packages/*/docs/`, `knowledge/*.md` | Shipped library truth |
| `AGENTS.md`, `.cursor/rules/` | Agent instructions (enforce in CI where possible) |
| `_ai-docs/audit/` | Point-in-time audit snapshot (2026-08-27) |
| `roadmap/` | Product backlog & layer policy |
| `tickets/` + `tickets/triage.yaml` | Maintainer / consumer tickets |

## How to use this program

1. Read **[program-guide.md](./program-guide.md)** — phases, how to add work, handoff rules.
2. Read **[01-executive-assessment.md](./01-executive-assessment.md)** — why we are doing this.
3. Execute the **current phase** in **[roadmap.md](./roadmap.md)** (one initiative at a time).
4. Log new findings in **[03-findings-register.md](./03-findings-register.md)** and new tasks in **[tasks.yaml](./tasks.yaml)**.
5. When a task ships to the real repo, mark it **verified** with command evidence — do not claim done without CI paths.

## Document map (deliverables A–H)

| Doc | Workstream | Purpose |
| --- | --- | --- |
| [01-executive-assessment.md](./01-executive-assessment.md) | — | State, risks, strengths |
| [02-inventory.md](./02-inventory.md) | A | Packages, tooling, CI, docs/agents |
| [03-findings-register.md](./03-findings-register.md) | A,B | Evidence, severity, disposition |
| [04-target-architecture.md](./04-target-architecture.md) | B | Layers, dependency rules |
| [05-engineering-standards.md](./05-engineering-standards.md) | C | Mandatory vs conditional rules |
| [06-documentation-strategy.md](./06-documentation-strategy.md) | D | SoT, generate vs author |
| [07-ai-workflow-audit.md](./07-ai-workflow-audit.md) | E | Rules/skills conflicts |
| [08-canonical-agent-workflow.md](./08-canonical-agent-workflow.md) | E | State machine & artifacts |
| [09-tooling-and-sot-matrix.md](./09-tooling-and-sot-matrix.md) | F | GitHub vs repo vs MCP |
| [10-enforcement-design.md](./10-enforcement-design.md) | E,G | CI vs advisory |
| [roadmap.md](./roadmap.md) | H | Phased initiatives (dependency order) |
| [12-acceptance-model.md](./12-acceptance-model.md) | H | Program complete criteria |
| [tasks.yaml](./tasks.yaml) | H | Append-only task backlog |

Charter text: [SPEC.md](./SPEC.md).

## Current snapshot (verified 2026-10-23)

- **71** publishable `@eristack/*` packages under `packages/<category>/<name>/` (see [02-inventory.md](./02-inventory.md)).
- **CI:** `.github/workflows/ci.yml` → PR: `pnpm eristack ci --base origin/main`; main push: `pnpm eristack check --profile pr`.
- **Agent entry:** `pnpm eristack plan --json`, `@eristack/ai-dev`, `@eristack/ai-knowledge` (82 recipes per last sync).
- **Existing audit:** `_ai-docs/audit/executive-summary.md` (B− / C+ grades) — reconcile, do not blindly trust without re-verification.

## Adding work “along the way”

When discovery or implementation reveals new scope:

1. Add a row to **03-findings-register.md** (fact vs inference).
2. Add a task to **tasks.yaml** with `id`, `phase`, `blocks`, `acceptance`.
3. If it changes program order, update **roadmap.md** (one paragraph rationale).
4. Do **not** edit authoritative skills/recipes until the task is **approved** and moved to “implement” state.
