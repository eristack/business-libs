# Maintainer tickets (`tickets/`)

Portable `@eristack/ai-ticket-generator` files landed from consumers (Tiga Sekawan ERP, household personal finance, etc.). Default consumer output dir is `.eristack/tickets/`; this repo keeps a **curated copy** for maintainer planning.

## Triage workflow (2026-09-25 onward)

| Artifact | Role |
| --- | --- |
| [`triage.yaml`](./triage.yaml) | **Source of truth** for global rank + backlog tiers |
| [`20260925-index-maintainer-priority-stack.md`](./20260925-index-maintainer-priority-stack.md) | Human-readable stack for today’s cross-batch order |
| `20260925-index-*-eristack-gaps.md` | Per-consumer batch cover letters + local P0/P1 tables |
| `20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md` | Older Horizon A batch (mostly verify-shipped) |

### Ingest date

Use the **filename prefix** `YYYYMMDD`, not “when you read the file.” Example: `20260925-163554-…` and `20260925-201500-…` are both **2026-09-25**.

### Commands

```bash
pnpm ticket:triage list              # all files + meta
pnpm ticket:triage list --day 20260925
pnpm ticket:triage stack             # ordered stack from triage.yaml
pnpm ticket:triage check             # CI-style: no orphan ticket files
```

After adding a ticket markdown file, update `triage.yaml` and run `pnpm ticket:triage check`.

## Generating new tickets

```bash
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-bug
pnpm dlx @tanstack/intent@latest load @eristack/ai-ticket-generator#ai-ticket-suggest
```

See [`packages/ai/ai-ticket-generator/docs/workflow.md`](../packages/ai/ai-ticket-generator/docs/workflow.md) for the full fixer-upper loop.
