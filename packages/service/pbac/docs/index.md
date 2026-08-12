---
title: Overview
description: Software policies over business documents
sidebar_position: 1
---

# @eristack/pbac

Some rules are the same for every user: you cannot receive against a purchase order whose outstanding is ≤ 0; you cannot edit a locked invoice; you cannot approve a cancelled quote. Those are **software / business policies** over **document state**, not roles or personal limits.

`@eristack/pbac` registers those policies as functions, evaluates them against a document bag, and maps denials to **409 Conflict** in HTTP adapters so clients can tell “you personally may not” (403) from “the document forbids this” (409).

## What it answers

> Does this **document state** allow the operation?

## What it is

- **Policies** — `(input) => boolean | PbacDecision` over `document` (+ optional `related`)
- **`documents` helpers** — positive amounts, status sets, flag checks
- **`check` / `checkAll` / `authorize`**
- **Headless adapters** — Express (409), Nest, React

## What it is not

| Not this | Because |
| --- | --- |
| Role membership | `@eristack/rbac` → 403 |
| Personal attribute limits | `@eristack/abac` → 403 |
| A workflow engine | No timers, no human tasks — pure predicates |
| An ORM | You load the document; PBAC only decides |

## Layers

```text
@eristack/pbac                     core — createPbac / registerPolicy / check
        ├── /express               createRequireBusinessPolicy (409)
        ├── /nest                  PbacModule + PbacGuard
        └── /react                 useBusinessPolicy
```

## A minute of code

```ts
import { createPbac, documents } from "@eristack/pbac";

const pbac = createPbac();

pbac.registerPolicy({
  id: "purchase-order.can-receive",
  evaluate: documents.positiveAmount("outstandingMinor"),
});

const decision = await pbac.check("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor },
});
```

## HTTP semantics

| Layer | Deny means | Status |
| --- | --- | --- |
| RBAC / ABAC | This actor may not | **403** |
| PBAC | This document forbids the op | **409** |

## Where to go next

| Guide | Read it when |
| --- | --- |
| [Getting started](./getting-started.md) | Register and check |
| [Concepts](./concepts.md) | Local business law vs identity |
| [Document policies](./document-policies.md) | Status, amounts, 409, helpers |
| [Adapters](./adapters.md) | Express / Nest / React |
| [Recipes](./recipes.md) | Full stack gates |

## Related packages

- [`@eristack/rbac`](/docs/rbac) — who may attempt
- [`@eristack/abac`](/docs/abac) — attribute limits
- [`@eristack/qups`](/docs/qups) — line math when posting documents
