---
title: Overview
description: Boolean role-based permissions for Eristack services
sidebar_position: 1
---

# RBAC

`@eristack/rbac` answers one question:

> Does this **subject** have this **permission**?

The answer is always **true or false**. No attributes, no document state — that
is ABAC / PBAC.

```text
users (yours)
  id: user_1
     │ subject
     ▼
rbac_subject_roles ──► rbac_roles ──► rbac_role_permissions ──► rbac_permissions
```

Pair with `@eristack/jwt-auth` for identity, then gate routes with permissions.
