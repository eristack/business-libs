# Eristack roadmap

Living priority stack for `@eristack/*` — not a calendar, not a promise date.

| Doc | Read when |
| --- | --- |
| [Priorities](./priorities.md) | What is in flight and what ships next |
| [Layers](./layers.md) | Seven-layer taxonomy and package placement |
| [ERP](./erp.md) | Feature-module strategy, priority stack, module backlog |
| [Backlog](./backlog.md) | Longer horizon after near-term items land |

**New here?** Use the site guide at [/start](/start) — onboarding is not a package or roadmap layer.

## Principles

1. **Spine before verticals** — money, timestamps, auth, ledgers, and access control before ERP feature packages.
2. **Drizzle-default** — memory stores are tests and browser demos only.
3. **One sharp package** — focused libraries, not a platform.
4. **Docs + skills + recipes together** — every iteration updates `@eristack/ai-knowledge`.
5. **Thin adapters** — Express, Nest, React, Drizzle shells; apps own domain tables.

## Status legend

| Status | Meaning |
| --- | --- |
| **Shipped** | On npm with docs |
| **Alpha** | Usable; API may move |
| **Scaffold** | Package + docs; core API pending |
| **Planned** | Named; not started |
| **Coming soon** | Layer or package reserved on site |

## Layer stack

```text
01 Primitive       money, timestamp
02 Capability      doc-number, qups, stock, financial, valuations
03 Service         jwt-auth, rbac, abac, pbac, data-grid, hash-chained-ledger
04 Infrastructure  backseat (alpha), logger, rest (planned)
05 UI              multitab (scaffold), doc-shell (planned)
06 Features        ERP modules — coming soon
07 AI              ai-knowledge, ai-workflow, ai-ticket-generator
```

When priorities shift, edit the doc that owns the topic — then run `pnpm knowledge:sync` if product language or recipes change.
