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
| UI | command palette | ERP navigation helper |
| AI | Domain skill packs | Per-feature Intent skills when Features ship |

## ERP modules

All `@eristack/feature-*` backlog lives in [ERP](./erp.md) — edit the priority stack there, not here.

## Deferred / rejected

| Idea | Why not now |
| --- | --- |
| Full BPM engine | PBAC + app workflows enough for v1 |
| Multi-tenant SaaS kit | Apps own tenancy |
| Mobile RN kit | Web ERP first |
| HR, CRM, WMS, POS | See [ERP → Deferred](./erp.md#deferred) |
