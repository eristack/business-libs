---
title: RBAC permission naming
description: resource.action convention for roles and middleware
---

# RBAC permission naming

Load: `@eristack/ai-knowledge#dev-conventions` · HTTP codes: [http-errors](./http-errors.md).

Use **`{resource}.{action}`** — lowercase, dot-separated, verb last (`orders.read`, `goods-receipt.post`).

Document state gates → `@eristack/pbac`. Attribute limits → `@eristack/abac`. Role booleans → `@eristack/rbac`.

## Pattern

| Good | Avoid |
| --- | --- |
| `orders.read` | `readOrders`, `ORDERS_READ` |
| `settings.formats.manage` | nested resource with dot segments |

## HTTP mapping

| Layer | Deny code |
| --- | --- |
| RBAC | **403** `FORBIDDEN_PERMISSION` |
| ABAC | **409** `POLICY_DENIED` |
| PBAC | **409** `BUSINESS_POLICY_DENIED` |

Full guide: `packages/ai/ai-knowledge/knowledge/rbac-permissions.md`.
