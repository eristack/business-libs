---
name: doc-number-adapters
description: >
  @eristack/doc-number adapters: drizzle FormatStore + SequenceStore
  (doc_number_formats / doc_number_sequences), rest format CRUD + preview,
  express createDocNumberRouter, nest DocNumberModule, client createDocNumberClient,
  react DocNumberProvider / useDocNumberFormats. Use when persisting formats
  or wiring format-configuration HTTP/frontend shells; app injects db + docNumber.
metadata:
  type: adapter
  library: '@eristack/doc-number'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/doc-number/docs/stores.md'
  - 'eristack/business-libs:packages/doc-number/docs/adapters.md'
  - 'eristack/business-libs:packages/doc-number/docs/api-reference.md'
  - 'eristack/business-libs:packages/doc-number/src/drizzle/format-table.ts'
  - 'eristack/business-libs:packages/doc-number/src/drizzle/sequence-store.ts'
  - 'eristack/business-libs:packages/doc-number/src/rest/actions.ts'
  - 'eristack/business-libs:packages/doc-number/src/express/router.ts'
  - 'eristack/business-libs:packages/doc-number/src/nest/module.ts'
  - 'eristack/business-libs:packages/doc-number/src/client/create-client.ts'
  - 'eristack/business-libs:packages/doc-number/src/react/hooks.ts'
---

# @eristack/doc-number — Adapters

Package never opens DB connections or invents API base URLs. App injects `db`,
tables, `docNumber`, and client `baseUrl` / `getHeaders`.

## Drizzle

Default tables: `doc_number_formats`, `doc_number_sequences`.

```ts
import { createDocNumber } from "@eristack/doc-number";
import {
  createDocNumberFormatTable,
  createDocNumberSequenceTable,
  createDrizzleFormatStore,
  createDrizzleSequenceStore,
} from "@eristack/doc-number/drizzle";

const docNumber = createDocNumber({
  formats: createDrizzleFormatStore({ dialect: "pgsql", db, table: formatTable }),
  sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: sequenceTable }),
});
```

## Format configuration HTTP

Headless REST for settings UIs (not document allocation). Mount behind your auth.

| Method | Path | Action |
| --- | --- | --- |
| GET | `/formats?entityKey=` | list |
| GET | `/formats/active?entityKey=` | active |
| GET | `/formats/:id` | by id |
| POST | `/formats` | create |
| PATCH | `/formats/:id` | update |
| POST | `/preview` | preview pattern |

```ts
// Express
import { createDocNumberRouter } from "@eristack/doc-number/express";
app.use("/doc-number", requireAdmin, createDocNumberRouter({ docNumber }));

// Nest
import { DocNumberModule } from "@eristack/doc-number/nest";
DocNumberModule.registerAsync({
  inject: [DRIZZLE],
  useFactory: (db) => ({ docNumber: createDocNumber({ … }) }),
});
```

Activating a format deactivates siblings for the same `entityKey`.

## Client + React

```ts
import { createDocNumberClient } from "@eristack/doc-number/client";
import { DocNumberProvider, useDocNumberFormats } from "@eristack/doc-number/react";

const client = createDocNumberClient({
  baseUrl: () => appConfig.apiUrl,
  getHeaders: () => ({ Authorization: `Bearer ${token}` }),
});

function Settings() {
  const { formats, active, createFormat, updateFormat, preview } =
    useDocNumberFormats("invoice");
  // App owns the form UI
}
```
