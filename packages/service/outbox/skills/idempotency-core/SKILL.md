---
name: idempotency-core
description: >
  @eristack/idempotency createIdempotencyGuard and memory store — Wave 13 C2.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/service/idempotency/docs/getting-started.md
---

# @eristack/idempotency

`createIdempotencyGuard(store).run(key, fn)` replays completed results. **Memory store is tests only** — persist with Drizzle in production.
