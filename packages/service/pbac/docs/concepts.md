---
title: Concepts
description: Document policies vs roles vs attributes
sidebar_position: 3
---

# Concepts

PBAC encodes **local business law**: rules that apply regardless of who is signed in. Identity still matters for RBAC/ABAC; PBAC is the document gate afterward.

## Local business law

| Policy id | Meaning |
| --- | --- |
| `purchase-order.can-receive` | outstanding > 0 |
| `purchase-order.open` | status in open/partial |
| `invoice.not-locked` | locked flag unset |
| `quote.not-cancelled` | status ≠ cancelled |

The same clerk who is allowed to post GRs (RBAC) and within limit (ABAC) still cannot receive a fully closed PO (PBAC).

## Input shape

```ts
type PbacInput = {
  document: Record<string, unknown>;
  related?: Record<string, Record<string, unknown>>;
  subject?: string; // optional audit — policies usually ignore
  action?: string;
};
```

Load fresh document state before check — never trust a stale client flag alone.

## Decisions

```ts
type PbacDecision = {
  allowed: boolean;
  policyId: string;
  reason?: string;
};
```

`check` returns a decision. `authorize` throws `BusinessPolicyDeniedError`. `checkAll` fails closed on the first deny.

## HTTP status: 409 not 403

Express/Nest adapters use **409 Conflict** for denied business policies so clients can distinguish:

| Status | Meaning | Package |
| --- | --- | --- |
| 401 | Not authenticated | jwt-auth |
| 403 | Authenticated but not permitted | rbac / abac |
| 409 | Document state conflicts with the operation | **pbac** |

UI copy differs: “Ask your manager” vs “This PO is fully received.”

## Code-registered policies

Like ABAC, evaluate functions are registered in code at boot. Document **fields** live in your tables; policy **algorithms** live in the deploy.

## What PBAC is not

| Need | Use |
| --- | --- |
| `orders.create` membership | `@eristack/rbac` |
| Book-value ≤ limit | `@eristack/abac` |
| Multi-step approvals with assignees | Your workflow / BPM — PBAC can gate each step’s document predicate |

## Errors

| Error | When |
| --- | --- |
| `BusinessPolicyNotFoundError` | Unknown policy id |
| `BusinessPolicyDeniedError` | `authorize` / middleware deny |

## Next steps

- [Document policies](./document-policies.md) — helpers and transitions
- [Getting started](./getting-started.md)
- [Adapters](./adapters.md)
