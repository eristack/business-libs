---
title: Drizzle store and workshop server
description: Horizon B — createDrizzleBackseatStore with staged atomic() and bootWorkshopServer
sidebar_position: 7
---

# Drizzle store and workshop server (Horizon B)

Browser prototypes use IndexedDB (`@eristack/backseat/store`). **Express mirrors** use Drizzle + the same route registration as the web app — without importing Vite or React.

## Imports

```ts
import {
  createBackseatDocumentTables,
  createDrizzleBackseatStore,
} from "@eristack/backseat/drizzle";
import { bootWorkshopServer } from "@eristack/backseat/workshop";
```

Peer: `drizzle-orm` plus your driver (`better-sqlite3` workshop / `postgres` production).

## Tables

```ts
const tables = createBackseatDocumentTables("sqlite"); // or "pgsql"
// Default table: backseat_documents (collection, doc_id, payload JSON)
```

Run the matching migration in the app — the library exports table builders only.

## SQLite store + `atomic()`

better-sqlite3 cannot run **async** callbacks inside `db.transaction()`. `store.atomic()` therefore:

1. Runs async `work(tx)` against an in-memory **staging** overlay (same as IndexedDB).
2. On success, flushes touched collections inside a **sync** `sqlite.transaction()` via prepared statements.

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const sqlite = new Database("workshop.sqlite");
const db = drizzle(sqlite);
const tables = createBackseatDocumentTables("sqlite");

const store = createDrizzleBackseatStore({
  db,
  tables,
  dialect: "sqlite",
  sqlite,
  runSyncTransaction: (work) => {
    sqlite.transaction(work)();
  },
});

await store.atomic(async (tx) => {
  await tx.set("jobs", { id: "job_1", number: "JO/2026/00001" });
  await tx.set("costSheets", { id: "cs_1", jobId: "job_1" });
});
```

**Postgres:** omit `sqlite` / `runSyncTransaction`; flush uses Drizzle async `db.transaction()`.

Epoch bumps stay **after** `atomic()` commits (unchanged).

## Headless workshop boot

Keep `registerRoutes` in a **shared** module (or `packages/api-backseat`) — not inside `apps/web`:

```ts
import { bootWorkshopServer } from "@eristack/backseat/workshop";
import { registerHorizonDocumentSpine } from "@eristack/backseat/seeds";

const backseat = await bootWorkshopServer({
  store,
  baseUrl: "/api",
  registerRoutes: (api) => {
    registerHorizonDocumentSpine(api, { /* peers */ });
    // app-owned collections + registerRoute handlers
  },
  seed: async () => {
    await store.importSnapshot(await loadHorizonASeedV1());
  },
});

// Express proxy: forward /api/* to backseat.fetch (app-owned middleware)
```

Do not register routes twice — call `bootWorkshopServer` once at API startup.

## Related

- [Graduation](./graduation.md) — Horizon A → B checklist
- `@eristack/ai-knowledge#backseat-then-backend` — canonical derive-backend guide
