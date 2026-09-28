---
name: idempotency-adapters
description: >
  Drizzle idempotency store, Express wrapIdempotentHandler, client fetch helper — production path.
metadata:
  author: eristack
  version: "0.1"
sources:
  - packages/ai/ai-knowledge/knowledge/idempotency-and-outbox.md
---

# Idempotency adapters

- Store: `createDrizzleIdempotencyStore` + `createIdempotencyTables` from `@eristack/idempotency/drizzle`.
- Express: `wrapIdempotentHandler({ guard }, handler)` from `@eristack/idempotency/express`.
- Client: `createIdempotencyClientFetch()` from `@eristack/idempotency/client`.
- Use scoped `runScoped` with `hashIdempotencyRequest(body)` when not using Express wrapper.

Memory store: **unit tests only**.
