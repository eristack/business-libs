---
title: Getting started
description: Enqueue in the same database transaction as your domain row (PO, invoice, …).
---

# Getting started

```bash
pnpm add @eristack/outbox
```

Enqueue in the **same database transaction** as your domain row (PO, invoice, …). Workers call `@eristack/comms` / `@eristack/payment-manager` with stable derived idempotency keys.

```ts
import { generateEntityId } from "@eristack/entity-id";
import { createOutbox, createMemoryOutboxStore } from "@eristack/outbox";

const outbox = createOutbox(createMemoryOutboxStore()); // tests only — use Drizzle in prod

await outbox.enqueue({
  id: generateEntityId(),
  aggregateType: "purchase_order",
  aggregateId: po.id,
  messageType: "comms.send",
  payloadJson: JSON.stringify({ to, subject, text }),
  idempotencyKey: `po-${po.id}-confirmation-email`,
});
```

Production: `createDrizzleOutboxStore` from `@eristack/outbox/drizzle`. Canonical patterns: `@eristack/ai-knowledge#idempotency-and-outbox`.
