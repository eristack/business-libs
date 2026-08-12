---
title: Workflow
description: Agent handoff, ticket:check, and the fixer-upper loop
sidebar_position: 6
---

# Workflow

How tickets move from reporter → file → maintainer → agent fix.

## End-to-end

```text
1. Reporter hits a bug / has an idea
2. Agent or human runs Intent skill / CLI / library
3. Facts collected → validateTicket → writeTicketFile
4. Reporter reviews .eristack/tickets/<id>.md and sends it
5. Maintainer opens ticket in an agent session
6. Agent loads skills from ticket.yaml → reproduces → fixes → tests
7. Human reviews PR (humans own git in this repo)
```

## Generating (consumer / support agent)

### Bug

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug
# or
pnpm eristack-ticket bug --package @eristack/… --title "…" --summary "…" …
```

Rules for the generating agent:

- Ask for logs/repro; **do not invent** them
- Prefer warnings from `validateTicket` fixed before send
- Return the file path; do not auto-notify maintainers

### Suggestion

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest
```

- Run / trust `assessFeasibility` against `ticket.yaml`
- If `unlikely` / `needs-decision`, say so clearly and stop implementation
- Include an `implementationSketch` when `possible` / `partial`

## Maintainer fixer-upper

Open the markdown file in a coding agent. Follow the **Agent handoff** section in the ticket (rendered automatically):

1. Load package Intent skill(s) listed in `ticket.yaml` / ticket body
2. Reproduce from **Steps to reproduce** (or confirm cannot)
3. Implement along **Fix plan** / sketch; keep scope to the package
4. Add/adjust tests; run package `test` + `typecheck`
5. Update package docs if behavior/API changed
6. Leave a short note for the human about residual risk

For suggestions:

| Feasibility | Fixer action |
| --- | --- |
| `possible` | Implement sketch |
| `partial` | Implement + call out edges |
| `needs-decision` | Stop; ask maintainer |
| `unlikely` | Stop; redirect |

## `ticket:check` in CI

```bash
pnpm ticket:check
```

Fails the build when any publishable package is missing or has an invalid `ticket.yaml`. Run locally after adding a package:

```bash
pnpm eristack-ticket subscribe --package @eristack/new-pkg
# edit scope / skills
pnpm ticket:check
```

## Directory conventions

| Path | Role |
| --- | --- |
| `packages/.../ticket.yaml` | Subscription (committed) |
| `.eristack/tickets/*.md` | Generated tickets (usually local / attached; decide per repo ignore policy) |

Do not commit secrets into ticket logs (tokens, passwords). Redact before write.

## Coordination with other AI packages

| Package | Role |
| --- | --- |
| `@eristack/ai-ticket-generator` | Portable bug/suggestion files |
| `@eristack/ai-knowledge` | recommend / recipes / catalog |
| `@eristack/ai-workflow` | local backlog / sprint memory (optional; not a replacement for tickets) |

Use tickets for **cross-org handoff**. Use ai-workflow for **in-repo** sprint memory if you adopt it.

## Next steps

- [Recipes](./recipes.md)
- [Subscription](./subscription.md)
