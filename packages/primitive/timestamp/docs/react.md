---
title: React adapter
description: "@eristack/timestamp/react — TanStack Form helpers for TimestampJSON fields"
sidebar_position: 17
---

# React adapter

`@eristack/timestamp/react` keeps **TimestampJSON** in TanStack Form state and parses to typed `Timestamp` on submit.

```bash
pnpm add @eristack/timestamp @tanstack/react-form
```

```ts
import {
  timestampFormValue,
  parseTimestampFormValue,
  submitTimestampFormValue,
  createTimestampFieldValidators,
  timestampJSONSchema,
} from "@eristack/timestamp/react";
```

Overview: [Adapters](./adapters.md). Fetch revive: [Client](./client.md).

## Defaults and submit

```ts
import { instantOf } from "@eristack/timestamp";

const defaultPosted = timestampFormValue(
  instantOf("2026-08-22T02:30:00Z", "Asia/Jakarta"),
);
// { kind: "instant", instant: "...", timezone: "..." }

const onSubmit = ({ value }) => {
  const postedAt = submitTimestampFormValue(value.postedAt);
};
```

## Validators

```ts
const validators = createTimestampFieldValidators({
  required: true,
  kind: "instant", // optional — reject wall JSON in instant-only fields
});

<form.Field name="postedAt" validators={validators} />
```

## Zod in forms

Re-exported for co-located form schemas:

```ts
import { timestampJSONSchema, wallJSONSchema } from "@eristack/timestamp/react";
```

## datetime-local inputs

HTML `datetime-local` has no timezone. Typical pattern:

1. Separate **wall `local`** string field (from input) + **IANA zone** select.
2. Build `{ kind: "wall", local, timezone }` before submit.
3. Use `wallToInstantOnce` in core only when you need a one-off UTC fact — not for recurring schedules.

Document lossiness in your UI copy; do not store offset-less local strings as `timestamptz`.
