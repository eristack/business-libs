---
title: Production wiring
description: End-to-end Drizzle + Express + React path for doc-number
sidebar_position: 3
---

# Production wiring — `@eristack/doc-number`

Complete path from format registration to allocating invoice numbers inside Drizzle transactions, plus admin HTTP for format CRUD. **`next()` never over HTTP** — allocation runs in the document-create transaction.

Skill: `@eristack/doc-number#doc-number-adapters`.

---

## Install and peers

```bash
pnpm add @eristack/doc-number
pnpm add drizzle-orm postgres
pnpm add @eristack/data-grid   # regular dependency of doc-number (listFormats)
```

| Entry | Peer |
| --- | --- |
| `@eristack/doc-number` | — |
| `@eristack/doc-number/drizzle` | `drizzle-orm` + driver |
| `@eristack/doc-number/express` | `express` |
| `@eristack/doc-number/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/doc-number/react` | `react`, `@tanstack/react-query` |
| `@eristack/doc-number/backseat` | `@eristack/backseat` |

Dialect: **`"pgsql"`** in production.

---

## 1. Drizzle tables

```ts
// src/db/schema.ts
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
} from "@eristack/doc-number/drizzle";

export const docNumberFormats = createDocNumberFormatTable("pgsql");
export const docNumberSequences = createDocNumberSequenceTable("pgsql");
```

Include both in `drizzle-kit` schema array and migrate. Sequence table uses row-level locking for concurrent `next()` — see [Stores](./stores.md).

---

## 2. Core factory

```ts
// src/doc-number/create-doc-number.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { createDocNumber } from "@eristack/doc-number";
import {
  createDrizzleFormatStore,
  createDrizzleSequenceStore,
} from "@eristack/doc-number/drizzle";
import { docNumberFormats, docNumberSequences } from "../db/schema.js";

export const db = drizzle(pool);

export const docNumber = createDocNumber({
  formats: createDrizzleFormatStore({
    dialect: "pgsql",
    db,
    table: docNumberFormats,
  }),
  sequences: createDrizzleSequenceStore({
    dialect: "pgsql",
    db,
    table: docNumberSequences,
  }),
});
```

Bootstrap formats at deploy or via admin UI:

```ts
await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "INV-{YYYY}{MM}-{SEQ:5}",
  reset: "monthly",
  timezone: "Asia/Jakarta", // civil calendar for {YYYY}{MM}
});

await docNumber.registerFormat({
  entityKey: "invoice",
  pattern: "CGK-INV-{YYYY}-{SEQ:4}",
  reset: "yearly",
  scope: "CGK", // branch-scoped sequence
  prefix: "",
});
```

---

## 3. Allocate in document transaction

```ts
// src/invoices/create-invoice.ts
import { eq } from "drizzle-orm";
import { createDocNumber } from "@eristack/doc-number";
import {
  createDrizzleFormatStore,
  createDrizzleSequenceStore,
} from "@eristack/doc-number/drizzle";
import { docNumberFormats, docNumberSequences, invoices } from "../db/schema.js";

function docNumberFor(tx: typeof db) {
  return createDocNumber({
    formats: createDrizzleFormatStore({ dialect: "pgsql", db: tx, table: docNumberFormats }),
    sequences: createDrizzleSequenceStore({ dialect: "pgsql", db: tx, table: docNumberSequences }),
  });
}

export async function createInvoice(input: NewInvoice) {
  return db.transaction(async (tx) => {
    const allocated = await docNumberFor(tx).next({
      entityKey: "invoice",
      scope: input.branchId, // when format is scoped
      at: new Date(),
    });

    const [row] = await tx
      .insert(invoices)
      .values({
        ...input,
        number: allocated.value,
        version: 1,
      })
      .returning();

    return row;
  });
}
```

If the transaction rolls back, the sequence integer is **burnt** — acceptable gap, not a duplicate. See [Sequencing](./sequencing.md).

`peekNext` for UI hints — own route, label as estimate:

```ts
const hint = await docNumber.peekNext({ entityKey: "invoice", scope: branchId });
```

---

## 4. Express — format admin only

```ts
import { createDocNumberRouter } from "@eristack/doc-number/express";
import { createExpressRequireAuth } from "@eristack/jwt-auth/express";

app.use(
  "/doc-number",
  requireAuth,
  requireRole("admin"), // your RBAC
  createDocNumberRouter({ docNumber }),
);
```

Exposed: list/get/create/update formats, preview pattern. **Not** `next` / `peekNext`.

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/doc-number/formats?entityKey=invoice&…` | Data-grid query params |
| GET | `/doc-number/formats/active?entityKey=invoice` | Active format |
| POST | `/doc-number/formats` | Register format |
| PATCH | `/doc-number/formats/:id` | Update (deactivate old, activate new) |
| POST | `/doc-number/preview` | `{ pattern, sequence, at? }` → `{ value }` |

---

## 5. NestJS

```ts
import { DocNumberModule } from "@eristack/doc-number/nest";

@Module({
  imports: [
    DocNumberModule.register({
      docNumber,
      globalPrefix: "doc-number",
    }),
  ],
})
export class AppModule {}
```

Mount guards for admin-only format mutations.

---

## 6. React admin (formats screen)

```tsx
import { createDocNumberClient } from "@eristack/doc-number/client";
import { useDocNumberFormats } from "@eristack/doc-number/react";

const docNumberClient = createDocNumberClient({
  baseUrl: () => import.meta.env.VITE_API_URL + "/doc-number",
  getHeaders: async () => ({
    Authorization: `Bearer ${await auth.ensureAccessToken()}`,
  }),
});

function FormatAdmin() {
  const { data, isLoading } = useDocNumberFormats(docNumberClient, "invoice");
  // data.items, data.pageInfo — same envelope as data-grid lists
}
```

---

## 7. Branch scope + timezone

| Scenario | Config |
| --- | --- |
| One sequence per company | `entityKey: "invoice"`, no `scope` |
| Per-branch numbers | `scope: branchId` on format + `next({ scope })` |
| Monthly reset in Jakarta | `reset: "monthly"`, `timezone: "Asia/Jakarta"` |

Pass explicit `at` in tests; production defaults to server clock UTC unless `timezone` set on format.

---

## 8. Testing subpath note

Unit tests may use:

```ts
import {
  createMemoryFormatStore,
  createMemorySequenceStore,
} from "@eristack/doc-number";
```

Memory sequence store serializes `allocateNext` with a mutex — fine for Vitest, **not** for multi-process production.

Target: sqlite Drizzle integration test proving concurrent `next()` does not duplicate — audit backlog item. Until then, trust core mutex tests + Drizzle row-lock recipe in [Stores](./stores.md).

---

## 9. Horizon A (Backseat)

```ts
import { registerDocNumberBackseat } from "@eristack/doc-number/backseat";

registerDocNumberBackseat(api, { docNumber, basePath: "/doc-number" });
```

Seed active formats in IndexedDB before demo invoices. Same Express paths at graduation.

---

## Related

- [Getting started](./getting-started.md) — pure format → memory → Drizzle ladder
- [Stores](./stores.md) — table shapes and locking
- [HTTP & UI](./http-and-ui.md) — REST bodies
- [Recipes](./recipes.md) — monthly invoice pattern
