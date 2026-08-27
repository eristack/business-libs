---
title: Getting started
description: Install @eristack/money and create your first monetary amount
sidebar_position: 2
---

# Getting started

## Install

```bash
pnpm add @eristack/money
# or: npm install @eristack/money
# or: yarn add @eristack/money
```

## First amount

```ts
import { Money, Monetary, Rounding } from "@eristack/money";

const usd = Monetary.getCurrency("USD");
const price = Money.of("19.99", usd);

const tax = price.percentOf("7").with(Rounding.currencyDefault());
const total = Money.sum([price, tax]);

console.log(total.toString()); // 21.39 USD
console.log(total.toJSON());
// { currency: "USD", amount: "21.39" }
```

## ERP hello-world

```ts
import { Discount, Money, Rounding, Tax } from "@eristack/money";

const round = Rounding.currencyDefault();
const line = Money.of("120.00", "USD");
const net = line.with(Discount.ofPercent("10")).with(round);
const tax = net.with(Tax.onExclusive("11")).with(round);
const total = Money.sum([net, tax]);

const [a, b, c] = total.allocate(3);
// a + b + c === total
```

See [advanced arithmetic](./advanced-arithmetic.md) for totals, percentages, and tax helpers.

## Rules of thumb

1. Construct with **strings** (or minor-unit integers), not fractional `number`s
2. Round to currency scale at ledger boundaries (persist, display, post)
3. Keep FX rates outside the library; pass them into `Conversion.of(...)`
4. **Adapters:** [overview](./adapters.md) → [Drizzle](./drizzle.md) (SQL) · [REST](./rest.md) / [Zod](./zod.md) (wire) · [Express](./express.md) / [Nest](./nest.md) · [Client](./client.md) / [React](./react.md)

> [!AGENT]
> Load `@eristack/money#money-amounts` before wiring prices — construct with strings, never JS `number` literals for currency amounts. The docs skill strip above copies the Intent command.

Continue with [Concepts](./concepts.md).
