---
title: Backseat adapters
description: Package backseat subpaths for browser prototypes
---

# Package Backseat adapters

Spine packages expose `./backseat` and `./backseat/store`:

| Subpath | Use |
| --- | --- |
| `@eristack/<pkg>/backseat` | Memory-backed stores (tests) + `register*Backseat(api)` routes/actions |
| `@eristack/<pkg>/backseat/store` | `createIndexedDb*Stores()` — browser IndexedDB via `@eristack/backseat/store` |

Shared bridge utilities live at `@eristack/backseat/adapters` (`registerRestLikeRoutes`, date JSON helpers).

Packages with Backseat adapters: `doc-number`, `financial-ledger`, `qups`, `stock-movement`, `valuations`, `data-grid`, `hash-chained-ledger`, `jwt-auth`, `pbac`, `rbac`, `abac`.

See each package's `docs/backseat.md` for wiring examples.
