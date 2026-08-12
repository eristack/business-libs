---
title: Concepts
description: Policies, attributes, and decisions
sidebar_position: 2
---

# Concepts

## Policy = algorithm → boolean

```ts
evaluate(ctx) => boolean | { allowed, reason }
```

Typical inputs:

| Bag | Examples |
| --- | --- |
| `subject.attrs` | `maxBookValueMinor`, `department`, `warehouseIds` |
| `resource.attrs` | `bookValueMinor`, `warehouseId`, `ownerId` |
| `environment.attrs` | `now`, `channel` |
| `action` | `create`, `approve` |

## Majority use case

Per-user **limits** and **scopes** that roles alone cannot express:

- User may post goods receipts only up to 5,000,000 (minor units)
- User may only act on warehouses in their list
- Approver may only approve within their cost center

## What ABAC is not

| Need | Use |
| --- | --- |
| Role has permission `orders.create` | `@eristack/rbac` |
| PO outstanding must be > 0 (document rule) | `@eristack/pbac` |
