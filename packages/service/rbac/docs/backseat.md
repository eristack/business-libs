---
title: Backseat adapter
description: Wire @eristack/rbac into @eristack/backseat browser prototypes
---

# Backseat adapter

Exports:

- `@eristack/rbac/backseat` — `createBackseatRbacStores()`, `registerRbacBackseat()`
- `@eristack/rbac/backseat/store` — `createIndexedDbRbacStores()` (IndexedDB via `@eristack/backseat/store`)

Collections / notes: rbac.permissions, rbac.roles, rbac.subjectRoles, rbac.subjectPermissions.

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import { createBackseatRbacStores } from "@eristack/rbac/backseat";
import { registerRbacBackseat } from "@eristack/rbac/backseat";

const { backseatStore, ...stores } = createBackseatRbacStores();
const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerRbacBackseat(api, { /* package instance */ });
```

Browser: swap `createIndexedDbRbacStores({ dbName: "my-erp" })`. Graduation → Drizzle + REST adapters.
