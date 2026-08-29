# Backlog

Longer horizon — pull items into [Priorities](./priorities.md) only when near-term spine work is done.

| Layer | Idea | Value |
| --- | --- | --- |
| Primitive | Unit of measure | Qty conversion with ratio strings (pairs with qups) |
| Primitive | Fiscal calendar | Posting periods, year-end close flags |
| Primitive | Address / geo | Normalized address lines (pure data) |
| Capability | Tax | Rate tables, inclusive/exclusive on qups lines |
| Capability | Partner | Customer/supplier ids (not CRM marketing) |
| Capability | Payment terms | Net 30, discount dates — pairs with money |
| Capability | Serial / batch | Extends stock lot model |
| Service | Audit log | Domain events append-only |
| Service | Outbox | Reliable webhook/email dispatch |
| Service | File store | Signed URL abstraction (app-owned buckets) |
| Service | Scheduler | Cron as data — app runs workers |
| UI | doc-shell | Document header: status, actions, audit strip |
| UI | data-dense table | data-grid + shadcn recipes |
| UI | command palette | Workspace navigation helper |
| AI | Domain skill packs | Optional Intent packs when apps need them |

## Draft catalog (planning only)

Named candidates, dependencies, and waves live in **[Horizon](./horizon.md)**. That doc does **not** change shipped layers, priorities, or recipes until a human promotes an item here or into [Priorities](./priorities.md).

## Deferred / rejected

| Idea | Why not now |
| --- | --- |
| `@eristack/feature-*` vertical modules | Layer 06 — [features.md](./features.md); brainstorm horizontal packages instead ([catalog-wave2.md](../_ai-docs/brainstorm/catalog-wave2.md)) |
| Full BPM engine | PBAC + app workflows enough for v1 |
| Multi-tenant SaaS kit | Apps own tenancy |
| Mobile RN kit | Web-first |
| HR, CRM, WMS, POS | Out of scope for the library layer |
