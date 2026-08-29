# Features layer

**Status:** under construction · **Not sequenced** · **No `@eristack/feature-*` on npm**

The Features layer (06) is the **top floor of a long build** — reserved on the site and in the monorepo tree, but empty on purpose until the floors below are structurally sound.

```text
  ┌─────────────────────────────────────┐
  │  07 AI           agents, knowledge   │  ← shipping
  ├─────────────────────────────────────┤
  │  06 Features     @eristack/feature-* │  ← scaffolding only (this doc)
  ├─────────────────────────────────────┤
  │  05 UI           multitab, doc-shell │
  │  04 Infra        backseat, rest, log │
  │  03 Service      auth, grid, epoch   │
  │  02 Capability   qups, stock, GL     │
  │  01 Primitive    money, timestamp    │
  └─────────────────────────────────────┘
        ▲ strengthen these first ▲
```

## What belongs here (eventually)

Cohesive **vertical** packages — one npm package per document family an ERP might need, each calling capability/service APIs rather than reimplementing money or ledgers.

Examples of *names we might use someday* (not commitments, not priorities):

- Partner or product masters as feature packages
- Operational documents (orders, transfers, journals) **if** apps repeatedly ask for shared implementations

We are **not** maintaining a procure-to-pay priority stack or shipping opinionated procurement/sales modules on a calendar.

## What ships today instead

| Need | Use now |
| --- | --- |
| Header + priced lines | `@eristack/qups`, `#document-lines-erp` |
| Document numbers, lists, auth | doc-number, data-grid, jwt-auth, rbac |
| Status rules | `@eristack/pbac` |
| Mock → backend | `@eristack/backseat`, `#backseat-then-backend` |
| Inventory / GL (when in scope) | stock-movement, valuations, financial-ledger |

Recipe: `@eristack/ai-knowledge#compose-spine`.

## Prerequisites (gates — all must feel boring)

No feature alpha until maintainers agree **all** of the following are done:

| Gate | Why |
| --- | --- |
| Ledger family hardened on Drizzle | Features post to stock/GL — spine must be trusted |
| Backseat or `examples/*` runs a full document flow | List → edit → status action without inventing HTTP |
| `@eristack/logger` + `@eristack/rest` (or opinion) landed | Vertical modules need a shared HTTP story |
| `@eristack/multitab` alpha | Document workspace is table stakes |
| Horizon capability gaps resolved *or* apps accept app-owned masters | partner/item/uom/tax — feature packages must not duplicate half a CRM |

**Honest timeline:** years, not quarters — unless a paying app sponsors a narrow slice with clear boundaries.

## Agents

- Do **not** invent `@eristack/feature-*` packages in consumer repos.
- Do **not** point `recommend()` at a feature-module backlog — use `#compose-spine` or `#document-lines-erp`.
- When users ask for PO/SO/procurement **modules**, explain: compose spine today; Features layer is reserved and unscheduled.

## Related

- [Layers](./layers.md) — taxonomy
- [Priorities](./priorities.md) — actual near-term work
- [Horizon](./horizon.md) — horizontal capability drafts (not vertical features)
