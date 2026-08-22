---
title: Express adapter
description: "@eristack/timestamp/express — readTimestamp and sendTimestamp for Express routes"
sidebar_position: 14
---

# Express adapter

`@eristack/timestamp/express` wraps [@eristack/timestamp/rest](./rest.md). No router or middleware factory.

```bash
pnpm add @eristack/timestamp express
```

```ts
import {
  readTimestamp,
  readTimestampField,
  sendTimestamp,
  RestTimestampFieldError,
} from "@eristack/timestamp/express";
```

Overview: [Adapters](./adapters.md).

## Read request bodies

```ts
import type { Request, Response } from "express";

app.post("/invoices", (req, res) => {
  try {
    const postedAt = readTimestamp(req.body.postedAt, "postedAt");
    const dueAt = readTimestampField(req.body, "dueAt");
    // business logic…
    res.json({ postedAt: sendTimestamp(postedAt) });
  } catch (error) {
    if (error instanceof RestTimestampFieldError) {
      return res.status(400).json({ issues: error.issues });
    }
    throw error;
  }
});
```

- `readTimestamp(value, path?)` — same as `parseTimestampJSON`
- `readTimestampField(body, field)` — one key from a body object
- `sendTimestamp(ts)` — `serializeTimestamp`

Never duplicate validation in route handlers — import from `/express` or `/rest` only.
