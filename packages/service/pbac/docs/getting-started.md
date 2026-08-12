---
title: Getting started
description: Register document policies and check()
sidebar_position: 2
---

# Getting started

## Installation

```bash
pnpm add @eristack/pbac
```

| Entry | Peer |
| --- | --- |
| `@eristack/pbac` | — |
| `@eristack/pbac/express` | `express` |
| `@eristack/pbac/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/pbac/react` | `react` |

## Create and register

```ts
import { createPbac, documents } from "@eristack/pbac";

const pbac = createPbac();

pbac.registerPolicy({
  id: "purchase-order.can-receive",
  description: "Outstanding quantity/amount must be positive",
  evaluate: documents.positiveAmount("outstandingMinor"),
});

pbac.registerPolicy({
  id: "purchase-order.open",
  evaluate: documents.statusIn("status", ["open", "partial"]),
});
```

## Check

```ts
const decision = await pbac.check("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor },
});

decision.allowed;
decision.reason; // when denied
```

## Authorize

```ts
await pbac.authorize("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor },
});
// throws BusinessPolicyDeniedError
```

## Multiple policies

```ts
await pbac.checkAll(
  ["purchase-order.open", "purchase-order.can-receive"],
  { document: po },
);
```

## Custom evaluate

```ts
pbac.registerPolicy({
  id: "invoice.lines-exist",
  evaluate: (input) => {
    const lines = input.related?.lines;
    const ok = Array.isArray(lines) && lines.length > 0;
    return {
      allowed: ok,
      policyId: "",
      reason: ok ? undefined : "Invoice has no lines",
    };
  },
});

await pbac.check("invoice.lines-exist", {
  document: invoice,
  related: { lines: invoiceLines },
});
```

## Next steps

- [Document policies](./document-policies.md) — helpers, transitions, 409
- [Adapters](./adapters.md)
- [Recipes](./recipes.md)
