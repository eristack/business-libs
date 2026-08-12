---
title: Recipes
description: Monthly invoices, per-tenant series, Redis allocation, and admin settings screens
sidebar_position: 9
---

# Recipes

End-to-end compositions. Prefer adapting one of these over inventing a new shape.

## Recipe: monthly invoice numbers

**Problem.** Invoices need `INV-202608-00001`, restarting at 1 each month, unique under concurrency, stored on the invoice row.

**Approach.**

1. Build one `docNumber` per request-scoped database handle.
2. Register the format once (migration, seed, or admin screen).
3. Allocate inside the transaction that inserts the invoice.

```ts
// numbering.ts
import { createDocNumber } from "@eristack/doc-number";
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
  createDrizzleFormatStore,
  createDrizzleSequenceStore,
} from "@eristack/doc-number/drizzle";

export const docNumberFormats = createDocNumberFormatTable("pgsql");
export const docNumberSequences = createDocNumberSequenceTable("pgsql");

/** Bind to a db *or* a transaction handle — the store never opens its own. */
export function docNumberFor(db: AppDb | AppTx) {
  return createDocNumber({
    formats: createDrizzleFormatStore({ dialect: "pgsql", db, table: docNumberFormats }),
    sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: docNumberSequences }),
  });
}
```

Seed the format once:

```ts
await docNumberFor(db).registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",
});
```

Allocate where the document is written:

```ts
export async function createInvoice(db: AppDb, input: NewInvoice) {
  return db.transaction(async (tx) => {
    const number = await docNumberFor(tx).next({ entityKey: "invoice" });

    const [invoice] = await tx
      .insert(invoices)
      .values({ ...input, number: number.value })
      .returning();

    return invoice;
  });
}
```

**Why it holds up.** The allocation and the insert share one transaction, so a failed invoice never leaves a number attached to nothing — only an unused gap. On PostgreSQL, add the `FOR UPDATE` lock from [Stores](./stores.md#concurrency-recipe) when two users can invoice at the same instant.

**Reading it back.** Store `number.value` on the row; store `number.sequence` and `number.periodKey` too if reporting wants "invoice 42 of August" without re-parsing strings.

## Recipe: per-tenant series with one `entityKey` convention

**Problem.** Acme and Globex must each start their invoice numbers at 1, with their own pattern, in one database.

**Approach.** Put the tenant in the `entityKey` and pick the convention in exactly one place.

```ts
// Single source of truth for the key shape.
export function invoiceKey(tenantId: string) {
  return `tenant:${tenantId}:invoice`;
}

await docNumberFor(db).registerFormat({
  entityKey: invoiceKey("acme"),
  pattern: "{YYYY}-{SEQ:5}",
  prefix: "ACME/",
  reset: "yearly",
});

const number = await docNumberFor(tx).next({ entityKey: invoiceKey(tenantId) });
// → "ACME/2026-00001"
```

**Why the prefix and not the pattern.** The tenant code is environmental. Keeping it on the record means the pattern stays identical across tenants, and `parseDocumentNumber` still works after you strip the prefix.

**Guardrails.**

- Never build the key inline at call sites — one helper, imported everywhere, or you *will* end up with `tenant:acme:invoice` and `acme:invoice` sharing a product.
- Authorize before you number. `entityKey` is a routing string, not a permission; a request that may not act for Acme must be rejected by your middleware first.
- Tenant onboarding should register a format as part of provisioning, so `next()` never meets a missing configuration.

## Recipe: Redis incrementer

**Problem.** Thousands of documents a minute; the row lock on `doc_number_sequences` has become the bottleneck.

**Approach.** Move allocation to Redis `INCR`, keep the SQL store for peeking and for its audit trail.

```ts
const docNumber = createDocNumber({
  formats: createDrizzleFormatStore({ dialect: "pgsql", db, table: docNumberFormats }),
  sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: docNumberSequences }),
  incrementer: async ({ formatId, periodKey }) =>
    redis.incr(`docnum:${formatId}:${periodKey}`),
});
```

`incrementer` takes precedence for `next()`; `peekNext()` still routes to the `SequenceStore`.

**Seed before you switch.** A fresh Redis key starts at 1 and would replay numbers you already issued. On cutover, prime each live bucket from SQL:

```ts
const current = await sequences.getCurrent({ formatId, periodKey });
await redis.set(`docnum:${formatId}:${periodKey}`, current ?? 0, { NX: true });
```

`NX` makes the seed idempotent across deploys and replicas.

**Know what you traded away.**

| Trade | Consequence |
| --- | --- |
| Allocation leaves the database transaction | A rolled-back insert always burns a number — gaps become more common |
| Two counters exist | `peekNext()` reads SQL and will drift from Redis unless you mirror writes |
| Redis durability settings apply | With `appendfsync everysec`, a crash can lose a few increments; a lost increment means a **reissued** number |

Mirror back asynchronously if you want the SQL table to stay meaningful:

```ts
incrementer: async ({ formatId, periodKey }) => {
  const value = await redis.incr(`docnum:${formatId}:${periodKey}`);
  void mirrorToSql(formatId, periodKey, value).catch(logger.warn);
  return value;
},
```

Only reach for this recipe when a measured lock-contention problem exists. The SQL path is correct by default; Redis is faster and looser.

## Recipe: admin settings screen

**Problem.** Finance edits the invoice pattern themselves — with a live preview and no deploy.

### Server (Express)

```ts
import { createDocNumberRouter } from "@eristack/doc-number/express";

app.use(
  "/doc-number",
  requireAuth,
  requireRole("admin"),
  createDocNumberRouter({ docNumber: docNumberFor(db) }),
);
```

Auth stays in your middleware — the router has no idea who is calling. For Nest, register `DocNumberModule` and either use the bundled controller or set `controller: false` and put `@UseGuards(AdminGuard)` on your own.

### Client

```ts
import { createDocNumberClient } from "@eristack/doc-number/client";

export const docNumberClient = createDocNumberClient({
  baseUrl: () => appConfig.apiUrl,
  getHeaders: async () => ({ Authorization: `Bearer ${await auth.token()}` }),
});
```

### Screen

```tsx
import { useForm } from "@tanstack/react-form";
import {
  useDocNumberFormats,
  createFormatFormOptions,
} from "@eristack/doc-number/react";

function InvoiceNumberingSettings() {
  const { formats, active, status, error, createFormat, updateFormat, preview } =
    useDocNumberFormats("invoice");
  const [sample, setSample] = useState("");

  const form = useForm(
    createFormatFormOptions({
      entityKey: "invoice",
      defaultValues: { pattern: active?.pattern ?? "", reset: active?.reset ?? "monthly" },
      onSubmit: async (value) => createFormat(value),
    }),
  );

  async function refreshSample(pattern: string) {
    try {
      setSample(await preview({ pattern, sequence: 1 }));
    } catch (e) {
      setSample((e as Error).message); // INVALID_PATTERN → show it inline
    }
  }

  if (status === "loading") return <Spinner />;
  if (status === "error") return <Alert>{error}</Alert>;

  return (
    <>
      <FormatTable
        rows={formats}
        activeId={active?.id}
        onActivate={(id) => updateFormat(id, { active: true })}
      />
      <PatternField form={form} onPreview={refreshSample} sample={sample} />
    </>
  );
}
```

**What each piece buys you.**

| Behaviour | Where it comes from |
| --- | --- |
| Table refreshes after save | Mutations invalidate the formats query key |
| "Active" badge follows the switch | Activating one format deactivates its siblings server-side |
| Live sample without consuming a number | `POST /preview` renders only; it never touches a counter |
| Bad patterns rejected before saving | `InvalidPatternError` → `400 INVALID_PATTERN` from the same validator core uses |

**Deliberately absent.** There is no "issue next number" button, because the API does not expose one. If finance wants to see what comes next, add your own endpoint on top of `peekNext()` and label it an estimate — see [HTTP & UI](./http-and-ui.md#what-is-and-is-not-exposed).

## Recipe: switching patterns at year end

**Problem.** From January, invoices should read `INV/2027/0001` instead of `INV-202612-00042`.

**Two options, different consequences:**

| Option | Do this | Counter |
| --- | --- | --- |
| Keep one series | `updateFormat({ id, pattern: "INV/{YYYY}/{SEQ:4}", reset: "yearly" })` | Continues — sequences are keyed by `formatId` |
| Start clean | `registerFormat({ entityKey: "invoice", pattern: …, active: true })` | Restarts at 1 under the new format id |

Either way the old record stays queryable (deactivated, never deleted), so historical numbers can still be parsed with the pattern that produced them:

```ts
const original = await docNumber.getFormatById(invoice.formatId);
const raw = original.prefix ? invoice.number.slice(original.prefix.length) : invoice.number;
const { sequence, parts } = parseDocumentNumber(original.pattern, raw);
```

Persisting `formatId` on the document is what makes this reliable years later. Do it.

## Recipe: numbering something that is not a document

`entityKey` is opaque, so the same machinery covers any human-facing identifier with a pattern and a counter:

| Thing | `entityKey` | Pattern | Reset |
| --- | --- | --- | --- |
| Support ticket | `ticket` | `TCK-{YY}{MM}-{SEQ:4}` | `monthly` |
| Batch / lot code | `batch` | `{YYYY}{MM}{DD}-{SEQ:3}` | `daily` |
| Customer code | `customer` | `C{SEQ:6}` | `never` |
| Warehouse pick list | `picklist` | `PL-{YY}{MM}{DD}-{SEQ:3}` | `daily` |

The rule that decides fitness is simple: if the value must be **unique, ordered, and readable**, this package fits. If it must be unguessable, use a UUID or a token — a padded counter is trivially enumerable.

## Next steps

- [Sequencing](./sequencing.md) — the concurrency model behind these recipes
- [Stores & Drizzle](./stores.md) — locking and custom stores
- [API reference](./api-reference.md) — every export
