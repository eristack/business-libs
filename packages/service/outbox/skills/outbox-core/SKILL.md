---
name: outbox-core
description: >
  @eristack/outbox transactional outbox: createOutbox(store).enqueue({ id, aggregateType,
  aggregateId, messageType, payloadJson, idempotencyKey }) inside the domain TX (build the Drizzle
  store on the tx handle), processBatch(limit, handlers) in a worker → comms/payment/PDF with
  outbox:${id} keys. Duplicate key returns existing row; failed is terminal until your SQL sweep;
  one worker per table. Drizzle store production, memory store tests only.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/outbox"
sources:
  - packages/service/outbox/docs/getting-started.md
---

# @eristack/outbox

Side effects become rows in the same transaction; a worker delivers them at-least-once with dedup keys.

```ts
import { createOutbox } from "@eristack/outbox";
import { createOutboxTables, createDrizzleOutboxStore } from "@eristack/outbox/drizzle";
import { generateEntityId } from "@eristack/entity-id";

export const outboxTables = createOutboxTables("pgsql");
const outboxIn = (h: typeof db | Tx) => createOutbox(createDrizzleOutboxStore({ db: h, tables: outboxTables }));

await db.transaction(async (tx) => {
  const [inv] = await tx.insert(invoices).values(v).returning();
  await outboxIn(tx).enqueue({ id: generateEntityId(), aggregateType: "invoice", aggregateId: inv.id,
    messageType: "email.invoice.issued", payloadJson: JSON.stringify({ invoiceId: inv.id }),
    idempotencyKey: `invoice-${inv.id}-issued-email` });          // derived, never random
});

await outboxIn(db).processBatch(50, {
  "email.invoice.issued": async (msg) => comms.send({ …, idempotencyKey: `outbox:${msg.id}` }),
});  // pending → processing (attempts+1) → processed | failed(lastError); unknown type → failed
```

## Checklist

1. `createOutboxTables(dialect)` in `schema.ts` → migration. `UNIQUE(idempotency_key)` is the dedup.
2. Enqueue only via a store built on the **tx** handle; key = `${aggregateType}-${aggregateId}-${effect}`.
3. Worker: single instance per table (claimBatch is select-then-update), loop `processBatch` with backoff on empty; on Vercel expose behind an authed cron route.
4. Cron SQL sweeps: `failed → pending` with exponential backoff on `attempts` (cap ~8); `processing` older than 10 min → `pending`.
5. Handlers idempotent; render templates/PDFs inside handlers; `@eristack/health` check on oldest pending age.

## Do not

- Use random UUIDs as `idempotencyKey`.
- Expect automatic retries or `FOR UPDATE SKIP LOCKED` — implement `OutboxStore.claimBatch` yourself if you need multi-worker.
- Put documents in `payloadJson` — ids only, versioned.
- Use `createMemoryOutboxStore` outside unit tests.
