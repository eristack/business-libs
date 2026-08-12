---
title: Choosing access control
description: Decision tree for RBAC vs ABAC vs PBAC
sidebar_position: 2
---

# Choosing access control

Eristack splits access into three packages so each gate stays small and testable. Pick by **what the question is about**, not by which acronym sounds enterprise.

```text
May this subject attempt the action at all?
  │
  ├─ yes/no by role / permission name ──────────────► @eristack/rbac  (403)
  │
  └─ yes, but only under personal limits / scopes
        │
        ├─ numbers, lists, departments on the actor ─► @eristack/abac  (403)
        │
        └─ document state forbids the op for everyone ► @eristack/pbac  (409)
```

## One-line tests

| If you can phrase it as… | Package |
| --- | --- |
| “Clerks may post goods receipts” | [`rbac`](/docs/rbac) |
| “This clerk’s max book value is 5M minor units” | **abac** (this package) |
| “This PO has nothing left to receive” | [`pbac`](/docs/pbac) |

## Decision tree (worked)

```text
Q1. Does the answer depend on WHO is signed in?
    │
    NO ──► PBAC (document / business rule). Example: locked invoice.
    │
    YES
    │
    Q2. Can you name a stable permission without embedding numbers?
    │     e.g. goods-receipt.post  (not goods-receipt.post.under-5m)
    │
    NO ──► You are smuggling attributes into RBAC. Use ABAC for the number.
    │
    YES
    │
    Q3. After the boolean permission, do you still need attrs
    │     (limits, warehouse list, cost center)?
    │
    YES ──► RBAC then ABAC
    NO  ──► RBAC alone
    │
    Q4. Regardless of who, can document state still block the op?
    │
    YES ──► Add PBAC last (409)
```

## Stacking order

Always cheap → expensive → document:

```text
jwt-auth (401) → rbac (403) → abac (403) → pbac (409) → handler
```

```ts
await rbac.authorize(userId, "goods-receipt.post");
await abac.authorize("goods-receipt.book-value-limit", {
  subject: { id: userId, attrs: limits },
  resource: { attrs: { bookValueMinor } },
  action: "create",
});
await pbac.authorize("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor, status: po.status },
});
```

| Layer | Deny means | HTTP |
| --- | --- | --- |
| jwt-auth | Not authenticated | **401** |
| rbac | Role/permission missing | **403** |
| abac | Attribute policy denied | **403** |
| pbac | Document forbids the op | **409** |

UI copy should differ: “Ask your manager for `goods-receipt.post`” vs “Your book-value limit is 5M” vs “This PO is fully received.”

## Anti-patterns

| Smell | Why it hurts | Fix |
| --- | --- | --- |
| Permission `orders.approve.under-1m` | Catalog explodes; still need a comparison | RBAC `orders.approve` + ABAC limit |
| Encoding warehouse ids into role names | Role churn per org change | ABAC `resourceInSubjectList` |
| Putting “PO open?” into RBAC | Same for every user; wrong status code | PBAC `statusIn` → 409 |
| One mega-policy that checks role + attrs + PO | Untestable blob | Three packages, three `authorize` calls |

## When ABAC is enough alone

Rare: internal tools with no roles, only attribute rules. Most apps still want RBAC for the coarse gate so you can revoke a job function without rewriting every policy path.

## Cross-links

| Package docs | Start here |
| --- | --- |
| [`@eristack/rbac`](/docs/rbac) | [Permissions model](/docs/rbac/permissions-model) |
| [`@eristack/abac`](./index.md) | [Attributes](./attributes.md) |
| [`@eristack/pbac`](/docs/pbac) | [Document policies](/docs/pbac/document-policies) |
| PBAC copy of this tree | [/docs/pbac/choosing-access-control](/docs/pbac/choosing-access-control) |

## Next steps

- [Getting started](./getting-started.md) — register a limit policy
- [Edge cases](./edge-cases.md) — missing attrs, floats, empty combinators
- [Adapters](./adapters.md) — Express / Nest middleware order
