# ERP spine example (skeleton)

Runnable **PO line → GR post → stock verify** using existing 0.x packages — no `@eristack/feature-*` yet.

## What this proves

- `@eristack/qups` — calculate a PO line
- `@eristack/stock-movement` — append receipt with `idempotencyKey`
- Chain verify after post

## Run tests

From repo root:

```bash
pnpm --filter @eristack/example-erp-spine test
```

## Grow later (backlog)

- Express + Drizzle app-owned PO/GR tables (mirror `examples/express`)
- jwt-auth + data-grid lists
- pbac policies from `packages/ai/ai-knowledge/knowledge/pbac-transitions.md`

Canonical compose guide: `@eristack/ai-knowledge` → `knowledge/procurement-spine.md`.
