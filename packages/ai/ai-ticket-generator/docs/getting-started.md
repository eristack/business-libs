---
title: Getting started
description: ticket.yaml, bug vs suggest skills, and ticket:check
sidebar_position: 2
---

# Getting started

`@eristack/ai-ticket-generator` produces **portable markdown tickets** (`.eristack/tickets/<id>.md`) for bugs and feature suggestions, with feasibility gates for suggestions. Every publishable `@eristack/*` package must ship **`ticket.yaml`** — CI enforces it via `pnpm ticket:check`.

---

## Install (consumers)

No runtime dependency required for filing tickets — use Intent skills or CLI:

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest
```

Monorepo maintainers:

```bash
pnpm add -D @eristack/ai-ticket-generator   # optional: library API
pnpm ticket:check                            # root script
pnpm eristack-ticket --help                  # CLI alias
```

---

## `ticket.yaml` flow (every package)

Each publishable package commits `packages/<category>/<name>/ticket.yaml`:

```yaml
package: "@eristack/jwt-auth"
title: jwt-auth
maintainers:
  - support@eristack.dev
scope: >
  JWT access tokens, refresh rotation, credential store child of app users.
outOfScope: >
  OAuth providers, users table, UI login screens.
skills:
  - jwt-auth-core
  - jwt-auth-adapters
```

| Field | Purpose |
| --- | --- |
| `package` | npm name — must match `package.json` |
| `scope` | What maintainers will fix |
| `outOfScope` | Stops agents implementing out-of-band work |
| `skills` | Intent skill ids to load in fixer session |
| `maintainers` | Contact for human escalation |

Bootstrap a new package subscription:

```bash
pnpm eristack-ticket subscribe --package @eristack/new-pkg
# edit scope / skills / maintainers
pnpm ticket:check
```

See [Subscription](./subscription.md) for validation rules.

---

## Bug tickets vs suggestion tickets

| | **Bug** (`#ai-ticket-bug`) | **Suggestion** (`#ai-ticket-suggest`) |
| --- | --- | --- |
| Use when | Wrong behavior, regression, crash | Feature idea, API extension |
| Skill | `@eristack/ai-ticket-generator#ai-ticket-bug` | `@eristack/ai-ticket-generator#ai-ticket-suggest` |
| CLI | `pnpm eristack-ticket bug --package … --title …` | `pnpm eristack-ticket suggest …` |
| Evidence | Logs, repro steps required — **do not invent** | Feasibility assessment required |
| Output | `.eristack/tickets/<timestamp>-bug-….md` | `.eristack/tickets/<timestamp>-suggestion-….md` |
| Agent rule | Return file path; human sends to maintainers | Stop if feasibility `unlikely` / `needs-decision` |

### Bug flow (support agent)

1. Load `#ai-ticket-bug` skill
2. Collect: package name, version, logs, steps to reproduce, expected vs actual
3. Run generator → review markdown
4. Redact secrets (tokens, passwords)
5. Send file to maintainer — **humans own git/PR**

### Suggestion flow

1. Load `#ai-ticket-suggest` skill
2. Describe user goal + proposed API
3. Tool runs `assessFeasibility` against target package `ticket.yaml`
4. If `possible` / `partial` → include `implementationSketch`
5. If `unlikely` → explain redirect; do not implement silently

Feasibility table: [Suggestion tickets](./suggestion-tickets.md).

---

## `pnpm ticket:check` / `eristack ticket check`

Root script (same as CLI check):

```bash
pnpm ticket:check
# equivalent: pnpm eristack-ticket check
# equivalent: pnpm eristack ticket check   (when ai-dev wired)
```

Fails when:

- Any publishable `@eristack/*` package lacks `ticket.yaml`
- YAML invalid or `package` field mismatch
- Required keys missing (`scope`, `skills`, …)

Run locally after adding a package. CI profile `pr` includes this check via `@eristack/ai-dev`.

---

## Maintainer fixer-upper loop

Open the generated markdown in a coding agent:

1. Load skills listed in ticket + `ticket.yaml`
2. Reproduce from **Steps to reproduce**
3. Fix in package scope; add tests
4. Update package docs + ai-knowledge if API/behavior changed
5. Human opens PR (agents in this repo do not commit)

Full workflow: [Workflow](./workflow.md).

---

## Library API (optional)

```ts
import { createBugTicket, validateTicket, writeTicketFile } from "@eristack/ai-ticket-generator";

const ticket = createBugTicket({ packageName: "@eristack/qups", title: "…", … });
const issues = validateTicket(ticket);
await writeTicketFile(ticket);
```

Prefer Intent skills for interactive collection.

---

## vs other AI packages

| Package | Role |
| --- | --- |
| **ai-ticket-generator** | Cross-org bug/suggestion handoff files |
| **ai-knowledge** | Route features to `@eristack/*` packages |
| **ai-dev** | `eristack check`, `ticket:check` in CI |
| **ai-workflow** | In-repo sprint/backlog memory (optional) |

Decision tree: `@eristack/ai-knowledge#ai-toolbox` → `knowledge/ai-toolbox-decision-tree.md`.

---

## Next steps

- [Ticket schema](./ticket-schema.md) — YAML + markdown fields
- [Bug tickets](./bug-tickets.md) — required sections
- [Suggestion tickets](./suggestion-tickets.md) — feasibility
- [Recipes](./recipes.md) — when recommend() should load ticket skills
