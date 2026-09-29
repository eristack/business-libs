---
title: Getting started
description: Production wiring — Drizzle tables, a same-transaction enqueue helper, the worker loop, retry and stuck-message sweeps, why one worker per table, and an admin view.
---

# Getting started

Layer responsibilities (HTTP key vs domain UNIQUE vs outbox) are in `@eristack/ai-knowledge#idempotency-and-outbox`. This page wires the package.

## Install

```bash
pnpm add @eristack/outbox @eristack/entity-id drizzle-orm
```

## 1. Tables

```ts
// schema.ts
import { createOutboxTables } from "@eristack/outbox/drizzle";
export const outboxTables = createOutboxTables("pgsql");    // outbox_messages
```

```bash
pnpm drizzle-kit generate && pnpm drizzle-kit migrate
```

Columns: `id` (entity id PK), `aggregate_type`, `aggregate_id`, `message_type`, `payload_json`, `idempotency_key` (unique), `status`, `attempts`, `last_error`, `created_at`, `updated_at`.

## 2. A same-transaction enqueue helper

The store is bound to whatever `db` you pass. To land the message in the domain transaction, build it on the **transaction handle**:

```ts
// outbox.ts
import { createOutbox, type EnqueueOutboxInput } from "@eristack/outbox";
import { createDrizzleOutboxStore } from "@eristack/outbox/drizzle";
import { generateEntityId } from "@eristack/entity-id";
import { outboxTables } from "./schema.js";

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function outboxIn(tx: Tx | typeof db) {
  return createOutbox(createDrizzleOutboxStore({ db: tx, tables: outboxTables }));
}

export function enqueueInput(input: Omit<EnqueueOutboxInput, "id" | "payloadJson"> & { payload: unknown }): EnqueueOutboxInput {
  return { id: generateEntityId(), payloadJson: JSON.stringify(input.payload), ...input };
}
```

```ts
// invoices.service.ts
await db.transaction(async (tx) => {
  const [invoice] = await tx.insert(invoices).values(values).returning();
  await outboxIn(tx).enqueue(enqueueInput({
    aggregateType: "invoice",
    aggregateId: invoice.id,
    messageType: "email.invoice.issued",
    idempotencyKey: `invoice-${invoice.id}-issued-email`,
    payload: { invoiceId: invoice.id },
  }));
  await outboxIn(tx).enqueue(enqueueInput({
    aggregateType: "invoice",
    aggregateId: invoice.id,
    messageType: "pdf.invoice",
    idempotencyKey: `invoice-${invoice.id}-pdf`,
    payload: { invoiceId: invoice.id },
  }));
});
```

If the insert fails, the messages never exist. If the process dies after commit, the messages are `pending` and the worker picks them up.

### Choosing `idempotencyKey`

Derive it from the aggregate and the effect: `${aggregateType}-${aggregateId}-${effect}`. Re-running the service (a retried HTTP request that slipped past the guard, a replayed job) then hits the unique index and `enqueue` returns the existing row — one email, not two. Do **not** use a random UUID; that defeats the dedup.

## 3. The worker

```ts
// worker.ts
import { outboxIn } from "./outbox.js";

const handlers = {
  "email.invoice.issued": async (msg) => {
    const { invoiceId } = JSON.parse(msg.payloadJson);
    const ctx = await loadInvoiceContext(invoiceId);
    await comms.send({
      channel: "email",
      to: ctx.customer.email,
      subject: renderEmailTemplate(ctx.tpl.subject, ctx.vars),
      html: renderEmailTemplate(ctx.tpl.html, ctx.vars, { escapeHtml: true }),
      idempotencyKey: `outbox:${msg.id}`,           // vendor-level dedup on redelivery
    });
  },
  "pdf.invoice": async (msg) => { /* @eristack/pdf-render → @eristack/file-manager */ },
};

export async function runOutboxOnce(limit = 50) {
  return outboxIn(db).processBatch(limit, handlers);
}

// Long-running process
while (true) {
  const n = await runOutboxOnce();
  await sleep(n === 0 ? 2_000 : 0);                 // drain fast, idle slow
}
// Vercel/cron: expose runOutboxOnce behind an authenticated route hit every minute
```

`processBatch` runs handlers **sequentially** and marks each `processed` or `failed` individually; one bad message does not block the rest of the batch.

## 4. Retries and stuck messages — you own the sweeps

The package marks failures; it does not schedule retries. Two SQL sweeps, run by the same cron:

```sql
-- Retry failed messages with backoff (attempts is incremented on each claim)
UPDATE outbox_messages
SET status = 'pending', updated_at = now()
WHERE status = 'failed'
  AND attempts < 8
  AND updated_at < now() - (interval '30 seconds' * power(2, attempts));

-- Recover messages a crashed worker left in 'processing'
UPDATE outbox_messages
SET status = 'pending', updated_at = now()
WHERE status = 'processing'
  AND updated_at < now() - interval '10 minutes';
```

Messages that exceed `attempts` stay `failed` for a human — surface them in an admin list with `last_error`.

## 5. One worker per table (important)

`claimBatch` in the Drizzle store is *select pending → update each to processing*. Two workers polling the same table can claim the same rows and run a handler twice. Options, in order of preference:

1. **Run one worker instance** per outbox table (a single cron, a singleton process). Handlers still use `outbox:${msg.id}` keys, so a rare double-run is harmless for comms/payment.
2. Implement `OutboxStore.claimBatch` with `SELECT … FOR UPDATE SKIP LOCKED` (Postgres) and pass your store to `createOutbox` — the rest of the package is unchanged.
3. Partition by `messageType` into separate tables (`createOutboxTables("pgsql", "outbox_email")`) so each worker owns a table.

## 6. Admin view

It is a table — expose it with `@eristack/data-grid`: filter by `status`, `messageType`, `aggregateId`; actions "retry" (`status = 'pending'`) and "discard" (`status = 'processed'`, note in `last_error`).

## Gotchas

- **Handlers must be idempotent**; delivery is at-least-once. Always pass a stable `idempotencyKey` to `@eristack/comms` / `@eristack/payment-manager`.
- **`failed` is terminal** until your sweep resets it. Without the sweep, a transient SMTP error means the email never goes out.
- `attempts` counts **claims**, incremented in `claimBatch` — it is already `1` during the first handler run.
- Unknown `messageType` → `failed` with `No handler for …`. Deploy handlers before enabling producers of a new type.
- `payloadJson` is opaque and stored as-is. Keep it small (ids, not documents) and versioned if handlers evolve (`{ v: 1, … }`).
- A duplicate `idempotencyKey` returns the **existing** message, including its `status` — do not assume `pending`.
- The memory store is per-process and never persists; tests only.

## Testing

```ts
import { createOutbox, createMemoryOutboxStore } from "@eristack/outbox";
import { expect, it, vi } from "vitest";

it("dedupes on key and processes once", async () => {
  const outbox = createOutbox(createMemoryOutboxStore());
  const input = { id: "m1", aggregateType: "invoice", aggregateId: "i1", messageType: "email", payloadJson: "{}", idempotencyKey: "invoice-i1-email" };
  await outbox.enqueue(input);
  const dup = await outbox.enqueue({ ...input, id: "m2" });
  expect(dup.id).toBe("m1");

  const handler = vi.fn(async () => {});
  expect(await outbox.processBatch(10, { email: handler })).toBe(1);
  expect(handler).toHaveBeenCalledTimes(1);
  expect(await outbox.processBatch(10, { email: handler })).toBe(0);   // nothing pending
});
```

For the Drizzle store, an in-memory SQLite `db` with `createOutboxTables("sqlite")` exercises the unique-violation path.
