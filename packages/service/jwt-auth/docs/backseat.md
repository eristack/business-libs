---
title: Backseat adapter
description: Wire this package into @eristack/backseat browser prototypes
---

# Backseat adapter

Use `@eristack/jwt-auth/backseat` for frontend-first ERP prototypes with IndexedDB persistence.

## Memory (tests / Storybook)

```ts
import { createBackseat, createMemoryBackseatStore } from "@eristack/backseat";
import {
  createBackseatJwtAuthStores,
  registerJwtAuthBackseat,
} from "@eristack/jwt-auth/backseat";
import { createJwtAuth } from "@eristack/jwt-auth";

const { backseatStore, credentials, refreshTokens } =
  createBackseatJwtAuthStores();

const jwtAuth = createJwtAuth({
  credentials,
  store: refreshTokens,
  accessSecret: process.env.ACCESS_SECRET!,
  refreshSecret: process.env.REFRESH_SECRET!,
});

const api = createBackseat({ store: backseatStore, baseUrl: "/api" });
registerJwtAuthBackseat(api, { jwtAuth });
```

## IndexedDB (browser default)

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbJwtAuthStores } from "@eristack/jwt-auth/backseat/store";
import { registerJwtAuthBackseat } from "@eristack/jwt-auth/backseat";

const { backseatStore, credentials, refreshTokens } =
  createIndexedDbJwtAuthStores({ dbName: "my-erp" });

// wire createJwtAuth + registerJwtAuthBackseat as above
```

Collections: `jwtAuth.credentials`, `jwtAuth.refreshTokens`.

Graduation: swap Query `queryFn` to real REST (`@eristack/jwt-auth/client`) and Drizzle stores — see `@eristack/backseat` graduation guide.
