---
title: Overview
description: Transactional outbox — enqueue side-effect messages in the same database transaction as the domain write, then a worker delivers them to comms, payments, PDFs with idempotent keys. Drizzle store for pgsql/mysql/sqlite; memory store for tests.
---

# @eristack/outbox

"Post the invoice, then email the customer" fails in two ways: the email goes out but the transaction rolls back (customer billed for nothing), or the transaction commits and the process dies before the email (customer never billed). The **transactional outbox** fixes both: write the *intent to email* as a row **inside the same transaction** as the invoice; a worker reads pending rows after commit and performs the side effect. If the worker crashes, the row is still there.

`@eristack/outbox` is that table, the enqueue call, and the batch processor. Handlers are yours; they call `@eristack/comms`, `@eristack/payment-manager`, `@eristack/pdf-render`, webhooks — anything that must happen *exactly because* a domain change committed.

Architecture across layers (HTTP idempotency → domain UNIQUE → outbox) is one canonical guide: `@eristack/ai-knowledge#idempotency-and-outbox`.

## Use it when

- A domain write must trigger email/SMS/WhatsApp, a payment capture, a PDF, a partner webhook, a search-index update.
- You need "at least once, deduplicated" delivery without a message broker.
- Side effects should be visible and retryable from an admin screen (it is a table).

## Not for

- Deduplicating the **HTTP request** that caused the write — `@eristack/idempotency`.
- High-throughput event streaming (thousands/sec) — a broker; the outbox can still be the bridge *to* it.
- Scheduled jobs unrelated to a domain write — a cron.

## Install

```bash
pnpm add @eristack/outbox @eristack/entity-id drizzle-orm
```

Peers: `@eristack/entity-id ^0.1.0` (UUID v7 ids), `drizzle-orm ^0.39–0.44` for `./drizzle`.

## 30-second example

```ts
import { createOutbox } from "@eristack/outbox";
import { createOutboxTables, createDrizzleOutboxStore } from "@eristack/outbox/drizzle";
import { generateEntityId } from "@eristack/entity-id";

export const outboxTables = createOutboxTables("pgsql");        // { messages } — export for migrations

// Enqueue INSIDE the domain transaction: build the store on the tx handle
await db.transaction(async (tx) => {
  const [invoice] = await tx.insert(invoices).values({ … }).returning();
  const outbox = createOutbox(createDrizzleOutboxStore({ db: tx, tables: outboxTables }));
  await outbox.enqueue({
    id: generateEntityId(),
    aggregateType: "invoice",
    aggregateId: invoice.id,
    messageType: "email.invoice.issued",
    payloadJson: JSON.stringify({ invoiceId: invoice.id, to: customer.email }),
    idempotencyKey: `invoice-${invoice.id}-issued-email`,        // stable, derived from the aggregate
  });
});

// Worker (cron / loop), outside any request
const outbox = createOutbox(createDrizzleOutboxStore({ db, tables: outboxTables }));
const processed = await outbox.processBatch(50, {
  "email.invoice.issued": async (msg) => {
    const { invoiceId, to } = JSON.parse(msg.payloadJson);
    await comms.send({ channel: "email", to, …, idempotencyKey: `outbox:${msg.id}` });
  },
});
```

## API

### Core (`@eristack/outbox`)

| Export | Signature | Notes |
| --- | --- | --- |
| `createOutbox` | `(store: OutboxStore) => Outbox` | |
| `outbox.enqueue` | `(input: EnqueueOutboxInput) => Promise<OutboxMessage>` | **Idempotent on `idempotencyKey`**: a duplicate returns the existing message (both stores) instead of inserting. |
| `outbox.processBatch` | `(limit: number, handlers: OutboxHandlers) => Promise<number>` | Claims up to `limit` oldest `pending` → `processing`, runs `handlers[messageType]`, marks `processed` or `failed` (with `lastError`). No handler for a type → `failed`. Returns count processed. |
| `EnqueueOutboxInput` | `{ id; aggregateType; aggregateId; messageType; payloadJson; idempotencyKey }` | `id` from `@eristack/entity-id`; `payloadJson` is a string — you serialize. |
| `OutboxMessage` | `EnqueueOutboxInput & { status; attempts; lastError?; createdAt; updatedAt }` | |
| `OutboxMessageStatus` | `"pending" \| "processing" \| "processed" \| "failed"` | `failed` is **terminal** until you reset it (see Getting started). |
| `OutboxHandlers` | `Record<string, (msg: OutboxMessage) => Promise<void>>` | Keyed by `messageType`. |
| `OutboxStore` | `{ enqueue; findByIdempotencyKey; claimBatch; markProcessed; markFailed }` | Implement for another DB or to add `FOR UPDATE SKIP LOCKED`. |
| `OutboxDuplicateKeyError` | `code: "OUTBOX_DUPLICATE_KEY"` | Only thrown by the memory store in a corrupted-index edge case; normal duplicates return the existing row. |
| `createMemoryOutboxStore` | `() => OutboxStore` | **Unit tests only.** |

### Drizzle (`@eristack/outbox/drizzle`)

| Export | Notes |
| --- | --- |
| `createOutboxTables(dialect, prefix = "outbox")` | `pgsql \| mysql \| sqlite`; table `${prefix}_messages` with `UNIQUE(idempotency_key)`. |
| `createDrizzleOutboxStore({ db, tables })` | `db` may be a transaction handle — that is how you get same-TX enqueue. Duplicate key (`23505` / `SQLITE_CONSTRAINT_UNIQUE`) → returns existing row. |

## Works with

- `@eristack/idempotency` — HTTP key dedupes the request; the outbox key (`invoice-${id}-issued-email`) dedupes the side effect. Different keys, different layers.
- `@eristack/comms` / `@eristack/payment-manager` — pass `idempotencyKey: \`outbox:${msg.id}\`` so vendor calls are safe on redelivery.
- `@eristack/email-template`, `@eristack/pdf-render`, `@eristack/spreadsheet-render` — render inside handlers, not inside the request.
- `@eristack/health` — a "pending older than 5 min" check is the best readiness signal for the worker.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/outbox#outbox-core`; architecture `@eristack/ai-knowledge#idempotency-and-outbox`.
- Recipe: `reliable-side-effects-outbox`.

## Next

- [Getting started](./getting-started.md) — migrations, same-TX enqueue helper, worker loop, retry/stuck sweeps, single-worker constraint, admin view.
