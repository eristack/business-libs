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
01 Primitive       money, timestamp, entity-id, percent, uom, fraction, address, person, phone, email-address, contact, geo, dimension, checksum, currency-pair, business-calendar, fiscal-calendar, payment-instrument
02 Registries      iso-3166, unlocode
03 Capability      doc-number, qups, stock-movement, financial-ledger, valuations, tax, rounding-policy, doc-transitions
04 Service         jwt-auth, oauth, api-key, rbac, abac, pbac, data-grid, epoch, hash-chained-ledger, idempotency, outbox, comms, email-template, file-manager, payment-manager, health, rate-limit, opinion, pdf-render, spreadsheet-render
05 Infrastructure  backseat (alpha), logger, rest, drizzle-kit-helpers, vercel-adapters
06 UI              multitab, design-system, doc-shell, list-shell, master-detail, line-grid, form-ui, filter-builder, command-palette, policy-ui
07 Features        under construction — packages/features/ empty
08 AI              ai-knowledge, ai-workflow, ai-ticket-generator, ai-dev
```

The authoritative per-package list (with descriptions) is the root [`README.md`](../README.md) § Packages; [Layers](./layers.md) explains placement rules.

When priorities shift, edit the doc that owns the topic — then run `pnpm knowledge:sync` if product language or recipes change.
