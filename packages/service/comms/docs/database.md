---
title: Database
description: Drizzle tables for messages and delivery events.
---

# Database

```ts
import { createCommsTables } from "@eristack/comms/drizzle";

const tables = createCommsTables("pgsql", "comms");
```

| Table | Purpose |
| --- | --- |
| `comms_messages` | One row per idempotent send (`vendor` + `idempotency_key` unique) |
| `comms_delivery_events` | Append-only webhook / status audit |

Store: `createDrizzleCommsStore({ db, tables })`.

Message statuses: `queued`, `sent`, `delivered`, `failed`, `bounced`.

Tests: `@eristack/comms/testing` memory store only.
