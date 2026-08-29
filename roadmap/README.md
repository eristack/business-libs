# Eristack roadmap

Living priority stack for `@eristack/*` — not a calendar, not a promise date.

| Doc | Read when |
| --- | --- |
| [Priorities](./priorities.md) | What is in flight and what ships next |
| [Horizon](./horizon.md) | **Planning only** — draft package catalog; does not override Priorities/Layers |
| [Layers](./layers.md) | Seven-layer taxonomy and package placement |
| [Features](./features.md) | Why layer 06 is empty and what must land first |
| [Backlog](./backlog.md) | Short horizon index — details in Horizon |

**New here?** Use the site guide at [/start](/start) — onboarding is not a package or roadmap layer.

## Principles

1. **Spine first** — money, timestamps, auth, ledgers, and access control before vertical feature packages.
2. **Drizzle-default** — memory stores are tests and browser demos only.
3. **One sharp package** — focused libraries, not a platform.
4. **Docs + skills + recipes together** — every iteration updates `@eristack/ai-knowledge`.
5. **Thin adapters** — Express, Nest, React, Drizzle shells; apps own domain tables and document models.

## Status legend

| Status | Meaning |
| --- | --- |
| **Shipped** | On npm with docs |
| **Alpha** | Usable; API may move |
| **Scaffold** | Package + docs; core API pending |
| **Planned** | Named; not started |
| **Under construction** | Layer or slot reserved; no packages yet |

## Layer stack

```text
01 Primitive       money, timestamp
02 Capability      doc-number, qups, stock, financial, valuations
03 Service         jwt-auth, rbac, abac, pbac, data-grid, hash-chained-ledger
04 Infrastructure  backseat (alpha), logger, rest (planned)
05 UI              multitab (scaffold), doc-shell (planned)
06 Features        under construction — packages/features/ empty
07 AI              ai-knowledge, ai-workflow, ai-ticket-generator, ai-dev
```

When priorities shift, edit the doc that owns the topic — then run `pnpm knowledge:sync` if product language or recipes change.
