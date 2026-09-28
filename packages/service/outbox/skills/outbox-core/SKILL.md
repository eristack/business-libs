---
id: outbox-core
title: Outbox core
package: "@eristack/outbox"
sources:
  - packages/ai/ai-knowledge/knowledge/idempotency-and-outbox.md
---

# @eristack/outbox

- Enqueue in the **same TX** as domain writes; `idempotencyKey` UNIQUE dedupes worker retries.
- Production: `@eristack/outbox/drizzle` — memory store is tests only.
- Handlers call `@eristack/comms` / `@eristack/payment-manager` with keys like `outbox:${messageId}`.
