---
title: Overview
description: Attribute policies that return true or false
sidebar_position: 1
---

# @eristack/abac

Roles answer “is this person a clerk?” Attribute policies answer “is this clerk allowed to post **this** goods receipt for **5M** at **warehouse W**?” The second question needs numbers and scopes, not another role name.

`@eristack/abac` runs **policy functions** against an attribute context and returns allow/deny. Policies are **code-registered** (not rows of serialized scripts). User limits live in **your** tables; you load them into `ctx.subject.attrs` at request time.

## What it answers

> Given these **attributes**, does policy X allow the action?

## What it is

- **Policies** — `(ctx) => boolean | PolicyDecision` (sync or async)
- **Context bags** — `subject`, `resource`, `action`, `environment`
- **`attrs` helpers** — path reads, subject limits, list membership
- **Combinators** — `evaluateAll` / `evaluateAny`
- **Headless adapters** — Express, Nest, React

## What it is not

| Not this | Because |
| --- | --- |
| Role membership | `@eristack/rbac` |
| Document software rules | `@eristack/pbac` (status, outstanding, locked) |
| A policy database | Functions are registered in code |
| An attribute store | You persist limits; ABAC only evaluates |

## Layers

```text
@eristack/abac                     core — createAbac / registerPolicy / evaluate
        ├── /express               createRequirePolicy
        ├── /nest                  AbacModule + AbacGuard + @RequirePolicy
        └── /react                 usePolicy
```

## A minute of code

```ts
import { createAbac, attrs } from "@eristack/abac";

const abac = createAbac();

abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
  }),
});

const decision = await abac.evaluate("goods-receipt.book-value-limit", {
  subject: { id: "user_1", attrs: { maxBookValueMinor: 5_000_000 } },
  resource: { type: "goods-receipt", attrs: { bookValueMinor: 1_200_000 } },
  action: "create",
});

decision.allowed; // true
```

## Stack with RBAC / PBAC

```text
RBAC  →  may attempt goods-receipt.post?     403
ABAC  →  within book-value / warehouse?      403
PBAC  →  PO still receivable?                409
```

## Where to go next

| Guide | Read it when |
| --- | --- |
| [Getting started](./getting-started.md) | Register and evaluate |
| [Concepts](./concepts.md) | Decisions, code-registered policies |
| [Attributes](./attributes.md) | Paths, helpers, stacking with RBAC |
| [Adapters](./adapters.md) | Express, Nest, React |
| [Recipes](./recipes.md) | Limits, scopes, full gate |

## Related packages

- [`@eristack/rbac`](/docs/rbac) — boolean permissions first
- [`@eristack/pbac`](/docs/pbac) — document state next
- [`@eristack/money`](/docs/money) — prefer minor units / strings for money attrs
