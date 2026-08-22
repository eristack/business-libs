---
title: REST adapter
description: "@eristack/timestamp/rest — parse and serialize TimestampJSON at HTTP boundaries"
sidebar_position: 12
---

# REST adapter

`@eristack/timestamp/rest` is a **framework-free codec** for `TimestampJSON`. No routes or middleware.

```ts
import {
  parseTimestampJSON,
  serializeTimestamp,
  parseTimestampFields,
  serializeTimestampFields,
  isTimestampJSON,
  validateTimestampJSON,
  RestTimestampFieldError,
} from "@eristack/timestamp/rest";
```

Overview: [Adapters](./adapters.md). Wire shape: [Serialization](./serialization.md).

## Wire shapes

Instant:

```json
{ "kind": "instant", "instant": "2026-08-22T02:30:00Z", "timezone": "Asia/Jakarta" }
```

Wall:

```json
{ "kind": "wall", "local": "2026-03-30T09:00:00", "timezone": "Europe/Paris" }
```

Validation delegates to core `validateTimestampJSON` + `timestampFromJSON` — **no duplicate ISO regex**.

## Parse

```ts
const posted = parseTimestampJSON(body.postedAt, "postedAt");

const { postedAt, dueAt } = parseTimestampFields(body, ["postedAt", "dueAt"]);
```

`parseTimestampFields` requires `body` to be a plain object.

## Serialize

```ts
res.json({ postedAt: serializeTimestamp(posted) });

const wire = serializeTimestampFields({ postedAt: doc.postedAt, dueAt: null });
```

## Errors

`RestTimestampFieldError`:

- `path` — field name
- `issues` — `[{ path, message }]`

Map to HTTP 400 in your handler. Express/Nest adapters throw this type from `/rest`.

## Express / Nest

See [Express](./express.md) and [Nest](./nest.md) for thin wrappers — they do not re-validate.
