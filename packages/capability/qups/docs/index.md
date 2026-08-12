---
title: Overview
description: Line pricing calculator for forms and the business layer
sidebar_position: 1
---

# QUPS

`@eristack/qups` is the **business calculator** for line pricing — use it
everywhere you touch qty / price / subtotal / discount / tax:

1. **TanStack Form** (and any UI) — recalculate on field change  
2. **Backend** — same `calculateLine` before insert/update  
3. **Optional Drizzle** — inject columns into your detail table (`itemId` + pricing)

You do **not** invent float math in React or SQL.

## Start here

```ts
import { calculateLine, patchLine, withQupsColumns } from "@eristack/qups";

let line = calculateLine({
  truth: "quantity+unitPrice",
  currency: "USD",
  quantity: "2",
  unitPrice: "50",
  taxRatePercent: "11",
  round: true,
});

// Form: user changed unit price
line = patchLine(line, { unitPrice: value });

// BE insert
await db.insert(invoiceLines).values(
  withQupsColumns({ invoiceId, itemId }, line),
);
```

| Next | Doc |
| --- | --- |
| Concepts (2-of-3 SoT) | [Concepts](./concepts.md) |
| Form + BE recipes | [Recipes](./recipes.md) |
| Injectable DB columns | [Stores & Drizzle](./stores.md) |
