---
title: Concepts
description: Subjects, roles, and boolean permissions
sidebar_position: 2
---

# Concepts

## Permission = boolean capability

A permission is a named capability such as `orders.create`. Either the subject
has it or they do not. There is no “maybe” and no numeric limit here.

Naming convention (majority practice):

```text
resource.action
orders.read
orders.create
orders.approve
goods-receipt.post
```

## Role = set of permissions

Roles package permissions for job functions (`clerk`, `manager`). Subjects get
roles; effective permissions = union of role permissions ∪ direct grants.

## Subject = your user id

Same as jwt-auth: RBAC never owns users. Assign with `subject: user.id`.

## What RBAC is not

| Need | Use |
| --- | --- |
| “Only if book value ≤ 5M” | `@eristack/abac` |
| “Only if PO outstanding > 0” | `@eristack/pbac` |
| Login / JWT | `@eristack/jwt-auth` |
