# Layers

Eight layers organize the monorepo and site. Lower layers never import higher ones.

| # | Layer | Role | Shipped / scaffold |
| ---: | --- | --- | --- |
| 01 | **Primitive** | Pure value types — core + optional adapters | money, timestamp, address, uom, geo (candidate), payment-instrument (candidate) |
| 02 | **Registries** | Authoritative code lists (ISO, UN, …) — validate/normalize; one package per code system | iso-3166, iso-4217, iso-639, unlocode (all **candidate**) |
| 03 | **Capability** | Reusable business capabilities + optional Drizzle | doc-number, qups, reference-data (candidate), stock-movement, financial-ledger, valuations |
| 04 | **Service** | Auth, access, lists, integrations, cache epochs | jwt-auth, file-manager, payment-manager (candidate), data-grid, epoch, hash-chained-ledger |
| 05 | **Infrastructure** | Runtime glue — logging, mock backend, REST shells | backseat (alpha), logger (planned), rest (planned) |
| 06 | **UI** | Headless React for dense operational workspaces | multitab (scaffold), doc-shell (planned) |
| 07 | **Features** | Vertical `@eristack/feature-*` modules | **Under construction** — see [Features](./features.md) |
| 08 | **AI** | Agent routing, workflow, tickets, maintainer CLI | ai-knowledge, ai-workflow, ai-ticket-generator, ai-dev |

**Filesystem:** `packages/primitive` → `packages/registries` → `capability` → `service` → `infrastructure` → `ui` → `ai`. Layer 07 Features has no packages yet.

**Today:** apps compose layers 01–05 (and AI tooling). Registries and payment-manager are **planned** — [`_ai-docs/brainstorm/registries-and-payment-manager.md`](../_ai-docs/brainstorm/registries-and-payment-manager.md).

## Next candidates (backlog)

| Layer | Idea | When |
| --- | --- | --- |
| Registries | iso-3166, unlocode, reference-data seeds | Forwarding / ID masters need validated codes |
| Primitive | geo, payment-instrument (token-safe card objects) | With payment-manager or checkout slice |
| Capability | Tax engine, partner normalization, reference-data | When apps need shared helpers |
| Service | payment-manager (PSP hub + webhooks + history), audit outbox | After file-manager pattern proven |
| UI | doc-shell, command palette | With multitab alpha |
| Features | Any `@eristack/feature-*` | After [gates in features.md](./features.md) — long horizon |

Full horizon list: [Backlog](./backlog.md). Sequenced work: [Priorities](./priorities.md).

**Draft-only ideas** (do not change this table until promoted): [Horizon](./horizon.md).
