# @eristack/ai-ticket-generator

Portable **bug** and **suggestion** tickets for every `@eristack/*` package.

Consumers (or their agents) generate a single markdown file with logs, scenario,
repro, fix plan / feasibility, and an agent handoff checklist — then send that
file to maintainers for an immediate fixer-upper.

## Mandatory subscription

Every publishable `@eristack` package must include a root `ticket.yaml`. CI
enforces this via:

```bash
pnpm ticket:check
```

## Quick start

```bash
pnpm add -D @eristack/ai-ticket-generator

pnpm eristack-ticket bug \
  --package @eristack/money \
  --title "…" \
  --summary "…" \
  --step "…" \
  --fix-plan "…"

pnpm eristack-ticket suggest \
  --package @eristack/data-grid \
  --title "…" \
  --summary "…"
```

Tickets land in `.eristack/tickets/*.md` by default.

## Library

```ts
import {
  createBugTicket,
  createSuggestionTicket,
  assessFeasibility,
  writeTicketFile,
  checkSubscriptions,
} from "@eristack/ai-ticket-generator";
```

See `docs/` for concepts, bug tickets, suggestion tickets, and subscription.
