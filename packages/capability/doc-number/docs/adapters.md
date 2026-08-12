---
title: HTTP & React adapters
description: Headless format configuration for Express, Nest, and React
sidebar_position: 5
---

# HTTP & React adapters

Format **configuration** adapters — list / get / create / update formats and
preview patterns so existing apps can wire a settings feature quickly.

Allocation (`next`) stays in your domain services. Auth is **your job**: mount
Express/Nest routes behind admin middleware or guards. React hooks are headless
(no form widgets).

Activating a format (`active: true`) deactivates other formats for the same
`entityKey`.

## REST (framework-agnostic)

```ts
import { createRestActions } from "@eristack/doc-number/rest";

const actions = createRestActions({ docNumber });
const result = await actions.listFormats({
  headers: { get: () => null },
  query: { entityKey: "invoice" },
});
```

| Action | Typical HTTP |
| --- | --- |
| `listFormats` | `GET /formats?entityKey=` (+ data-grid query params) → `{ items, pageInfo, query }` |
| `getActiveFormat` | `GET /formats/active?entityKey=` |
| `getFormatById` | `GET /formats/:id` |
| `createFormat` | `POST /formats` |
| `updateFormat` | `PATCH /formats/:id` |
| `preview` | `POST /preview` |

## Express

```ts
import { createDocNumberRouter } from "@eristack/doc-number/express";

app.use("/doc-number", requireAdmin, createDocNumberRouter({ docNumber }));
```

## Nest

```ts
import { DocNumberModule } from "@eristack/doc-number/nest";

DocNumberModule.registerAsync({
  imports: [DatabaseModule],
  inject: [DRIZZLE],
  useFactory: (db) => ({
    docNumber: createDocNumber({
      formats: createDrizzleFormatStore({ dialect: "pgsql", db, table }),
      sequences: createDrizzleSequenceStore({ dialect: "pgsql", db, table: seqTable }),
    }),
  }),
});
```

Routes under `/doc-number/*`. Set `controller: false` to inject `DOC_NUMBER` without registering routes.

## Client + React (headless)

```ts
import { createDocNumberClient } from "@eristack/doc-number/client";
import { DocNumberProvider, useDocNumberFormats } from "@eristack/doc-number/react";

const client = createDocNumberClient({
  baseUrl: () => import.meta.env.VITE_API_URL,
  getHeaders: () => ({ Authorization: `Bearer ${token}` }),
});

// React settings screen — you own the form UI
function InvoiceFormatSettings() {
  const { formats, active, createFormat, updateFormat, preview, status } =
    useDocNumberFormats("invoice");
  // …
}
```
