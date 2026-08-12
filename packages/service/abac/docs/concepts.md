---
title: Concepts
description: Policies, attribute context, and decisions
sidebar_position: 3
---

# Concepts

ABAC here means: **attributes in → algorithm → boolean decision**. Policies are ordinary TypeScript functions registered by id.

## Policy = algorithm → boolean

```ts
evaluate(ctx) => boolean | { allowed, reason?, policyId? }
```

Returning a bare `boolean` is fine; a `PolicyDecision` adds an optional `reason` for logs and HTTP bodies.

```ts
type PolicyDecision = {
  allowed: boolean;
  policyId: string;
  reason?: string;
};
```

`authorize` throws `PolicyDeniedError` when `allowed` is false. `evaluate` never throws for a deny — only for missing policies (`PolicyNotFoundError`).

## Context bags

| Bag | Examples |
| --- | --- |
| `subject.id` | User id (jwt-auth subject) |
| `subject.attrs` | `maxBookValueMinor`, `department`, `warehouseIds` |
| `resource.type` / `id` | Optional identifiers |
| `resource.attrs` | `bookValueMinor`, `warehouseId`, `ownerId` |
| `environment.attrs` | `now`, `channel`, `ip` |
| `action` | `create`, `approve` |

Paths in helpers are dotted from the **root context** (e.g. `subject.attrs.maxBookValueMinor`). See [Attributes](./attributes.md).

## Code-registered, not serialized

Policy **functions** live in your deploy. Do not expect to store `evaluate` bodies in SQL. What you persist:

- User/org **attribute values** (limits, scopes) in app tables
- Optionally a list of which policy ids apply to a route (usually hardcoded next to the route)

Re-register policies at process boot (module init).

## Majority use cases

Per-user **limits** and **scopes** roles cannot express:

- Post goods receipts only up to 5,000,000 (minor units)
- Act only on warehouses in `warehouseIds`
- Approve only within a cost center
- Deny outside business hours (`environment.attrs`)

## Combinators

| API | Semantics |
| --- | --- |
| `evaluate(id, ctx)` | One policy |
| `evaluateAll(ids, ctx)` | Fail closed on first deny |
| `evaluateAny(ids, ctx)` | Succeed on first allow |
| `authorize(id, ctx)` | Evaluate + throw on deny |

## What ABAC is not

| Need | Use |
| --- | --- |
| Role has `orders.create` | `@eristack/rbac` |
| PO outstanding must be > 0 | `@eristack/pbac` |
| Money arithmetic | `@eristack/money` (pass minor units into attrs) |

## Errors

| Error | When |
| --- | --- |
| `PolicyNotFoundError` | Unknown policy id |
| `PolicyDeniedError` | `authorize` / middleware when denied |

Express maps deny → **403** with `policyId` + `reason`.

## Next steps

- [Attributes](./attributes.md) — paths and helpers
- [Getting started](./getting-started.md) — first policy
- [Adapters](./adapters.md) — HTTP shells
