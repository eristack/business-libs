# @eristack/money

JSR 354–inspired money primitives for ERP and business software.

- Immutable `Money` amounts with strict currency checks
- Adaptive `bigint` / decimal engine
- Rounding, allocate/split, formatting, and app-supplied FX conversion

## Install

```bash
pnpm add @eristack/money
```

## Quick example

```ts
import { Money, Rounding } from "@eristack/money";

const price = Money.of("19.99", "USD");
const total = price
  .add(price.multiply("0.07"))
  .with(Rounding.currencyDefault());

console.log(total.toJSON());
// { currency: "USD", amount: "21.39" }
```

## Documentation

- **Source of truth:** [`docs/`](./docs/) (markdown + [`docs/_meta.json`](./docs/_meta.json))
- **Website:** rendered by [`apps/web`](../../apps/web) at `/docs/money` (Cmd/Ctrl+K search on the site)

Guides:

- [Overview](./docs/index.md)
- [Getting started](./docs/getting-started.md)
- [Concepts](./docs/concepts.md)
- [ERP recipes](./docs/recipes.md)
- [API reference](./docs/api-reference.md)


## AI agent skills

This package ships [Agent Skills](https://agentskills.io) via [TanStack Intent](https://tanstack.com/intent):

- `@eristack/money#money-amounts` — construct amounts and same-currency arithmetic
- `@eristack/money#money-ledger` — rounding, allocate, FX conversion, JSON

If you use an AI coding agent, run:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
npx @tanstack/intent@latest load @eristack/money#money-amounts
```
