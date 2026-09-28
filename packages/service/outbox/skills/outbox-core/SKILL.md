---
name: outbox-core
description: >
  @eristack/outbox transactional enqueue in the same TX as domain writes; Drizzle worker batch
  and idempotencyKey dedup for comms/payment side effects. Memory store tests only.
metadata:
  type: core
  library: "@eristack/outbox"
  library_version: "0.1.0"
sources:
  - packages/ai/ai-knowledge/knowledge/idempotency-and-outbox.md
---

# @eristack/outbox

- Enqueue in the **same TX** as domain writes; `idempotencyKey` UNIQUE dedupes worker retries.
- Production: `@eristack/outbox/drizzle` — memory store is tests only.
- Handlers call `@eristack/comms` / `@eristack/payment-manager` with keys like `outbox:${messageId}`.
