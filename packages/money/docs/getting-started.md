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

const tax = price.multiply("0.07");
const total = price.add(tax).with(Rounding.currencyDefault());

console.log(total.toString()); // 21.39 USD
console.log(total.toJSON());
// { currency: "USD", amount: "21.39" }
```

## ERP hello-world

```ts
import { Money, Rounding } from "@eristack/money";

const line = Money.of("120.00", "USD");
const discount = line.multiply("0.10").with(Rounding.currencyDefault());
const net = line.subtract(discount);
const tax = net.multiply("0.11").with(Rounding.currencyDefault());
const total = net.add(tax);

const [a, b, c] = total.allocate(3);
// a + b + c === total
```

## Rules of thumb

1. Construct with **strings** (or minor-unit integers), not fractional `number`s
2. Round to currency scale at ledger boundaries (persist, display, post)
3. Keep FX rates outside the library; pass them into `Conversion.of(...)`

Continue with [Concepts](./concepts.md).
