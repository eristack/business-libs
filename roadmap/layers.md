# Layers

Seven layers organize the monorepo and site. Lower layers never import higher ones.

| # | Layer | Role | Shipped / scaffold |
| ---: | --- | --- | --- |
| 01 | **Primitive** | Pure value types — no HTTP, DB, or React | money (alpha) |
| 02 | **Capability** | Reusable business capabilities + optional Drizzle | doc-number, qups, stock-movement, financial-ledger, valuations |
| 03 | **Service** | Auth, access, lists, ledger primitive | jwt-auth, rbac, abac, pbac, data-grid, hash-chained-ledger |
| 04 | **Infrastructure** | Runtime glue — logging, mock backend, REST shells | backseat (alpha), logger (planned), rest (planned) |
| 05 | **UI** | Headless React for ERP-shaped UX | multitab (scaffold), doc-shell (planned) |
| 06 | **Features** | ERP document modules as `@eristack/feature-*` | coming soon — see [ERP](./erp.md) |
| 07 | **AI** | Agent routing, workflow, tickets | ai-knowledge, ai-workflow, ai-ticket-generator |

## Next candidates (backlog)

| Layer | Idea | When |
| --- | --- | --- |
| Primitive | UoM conversion, fiscal calendar | Second consumer needs it |
| Capability | Tax engine, partner normalization | Before matching feature module |
| Service | Audit event stream, notification outbox | After spine is boring |
| UI | doc-shell, command palette | With multitab alpha |

Full horizon list: [Backlog](./backlog.md). Sequenced work: [Priorities](./priorities.md).
