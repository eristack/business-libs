---
title: Client adapter
description: "@eristack/timestamp/client — revive TimestampJSON after fetch"
sidebar_position: 16
---

# Client adapter

`@eristack/timestamp/client` revives wire JSON into typed `Timestamp` values after HTTP — no React dependency.

```ts
import {
  reviveTimestamp,
  reviveTimestampFields,
  isTimestampJSON,
} from "@eristack/timestamp/client";
```

Overview: [Adapters](./adapters.md).

## After fetch

```ts
const res = await fetch("/api/invoices/1");
const json = await res.json();

const postedAt = reviveTimestamp(json.postedAt);
const row = reviveTimestampFields(json, ["postedAt", "dueAt"]);
```

`reviveTimestamp` accepts:

- already-typed `ZonedInstant` / `WallClock` (passthrough)
- valid `TimestampJSON` (via core `parseTimestamp`)

## Type guard

`isTimestampJSON(value)` — shallow `{ kind, instant|local, timezone }` check before revive.

Use [@eristack/timestamp/react](./react.md) for TanStack Form field state; use `/client` in non-React apps and shared fetch utilities.
