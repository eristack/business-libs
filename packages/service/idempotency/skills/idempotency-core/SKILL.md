---
name: idempotency-core
description: >
  @eristack/idempotency createIdempotencyGuard and memory store — Wave 13 C2.
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/ai/ai-knowledge/knowledge/idempotency-and-outbox.md
---

# @eristack/idempotency

`createIdempotencyGuard(store).run(key, fn)` replays completed results. Production: Drizzle store + scoped keys + lease (`runScoped`, Express `wrapIdempotentHandler`). **Memory store is tests only.**
