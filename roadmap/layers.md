# Layers

Seven layers organize the monorepo and site. Lower layers never import higher ones.

| # | Layer | Role | Shipped / scaffold |
| ---: | --- | --- | --- |
| 01 | **Primitive** | Pure value types — core + optional adapters | money, timestamp |
| 02 | **Capability** | Reusable business capabilities + optional Drizzle | doc-number, qups, stock-movement, financial-ledger, valuations |
| 03 | **Service** | Auth, access, lists, ledger primitive, cache epochs | jwt-auth, rbac, abac, pbac, data-grid, epoch, hash-chained-ledger |
| 04 | **Infrastructure** | Runtime glue — logging, mock backend, REST shells | backseat (alpha), logger (planned), rest (planned) |
| 05 | **UI** | Headless React for dense operational workspaces | multitab (scaffold), doc-shell (planned) |
| 06 | **Features** | Vertical `@eristack/feature-*` modules | **Under construction** — see [Features](./features.md) |
| 07 | **AI** | Agent routing, workflow, tickets, maintainer CLI | ai-knowledge, ai-workflow, ai-ticket-generator, ai-dev |

**Today:** apps compose layers 01–05 (and AI tooling). Layer 06 is an empty reserved floor — spine hardening first, no feature packages on npm.

## Next candidates (backlog)

| Layer | Idea | When |
| --- | --- | --- |
| Primitive | UoM conversion, fiscal calendar | Second consumer needs it |
| Capability | Tax engine, partner normalization | When apps need shared helpers |
| Service | Audit event stream, notification outbox | After spine is boring |
| UI | doc-shell, command palette | With multitab alpha |
| Features | Any `@eristack/feature-*` | After [gates in features.md](./features.md) — long horizon |

Full horizon list: [Backlog](./backlog.md). Sequenced work: [Priorities](./priorities.md).

**Draft-only ideas** (do not change this table until promoted): [Horizon](./horizon.md).
