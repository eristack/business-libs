---
title: Production wiring
description: Postgres + S3 + Express + Vite client — end-to-end production path.
---

# Production wiring

**Memory stores are tests and Backseat only** — production uses **Drizzle + Postgres** and **S3** (or S3-compatible storage).

Skill: `@eristack/file-manager#file-manager-adapters`

---

## Install

```bash
pnpm add @eristack/file-manager @aws-sdk/client-s3 @aws-sdk/s3-request-presigner drizzle-orm
```

| Entry | Peer |
| --- | --- |
| `@eristack/file-manager` | — |
| `@eristack/file-manager/s3` | `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner` |
| `@eristack/file-manager/drizzle` | `drizzle-orm` + driver |
| `@eristack/file-manager/express` | `express` |
| `@eristack/file-manager/client` | — |
| `@eristack/file-manager/react` | `react`, `@tanstack/react-query` |
| `@eristack/file-manager/backseat` | `@eristack/backseat` |

Dialect: **`"pgsql"`** for Postgres.

---

## 1. Drizzle schema

```ts
import {
  createFileManagerTables,
} from "@eristack/file-manager/drizzle";

export const fileManagerTables = createFileManagerTables("pgsql", "file_manager");
// migrate: file_manager_files (id, status, namespace, owner_id, ref_json, timestamps)
```

App entity example:

```ts
export const invoices = pgTable("invoices", {
  id: text("id").primaryKey(),
  attachmentFileId: text("attachment_file_id"),
  // or: attachmentRef: text("attachment_ref"), // FileRef JSON
});
```

---

## 2. File manager instance (API)

```ts
import { createFileManager } from "@eristack/file-manager";
import { createS3StorageDriver } from "@eristack/file-manager/s3";
import { createDrizzleFileRecordStore } from "@eristack/file-manager/drizzle";

export const fileManager = createFileManager({
  driver: createS3StorageDriver({
    bucket: process.env.S3_BUCKET!,
    region: process.env.AWS_REGION!,
    // endpoint: process.env.S3_ENDPOINT, // MinIO / R2
    // forcePathStyle: true,
  }),
  store: createDrizzleFileRecordStore({ db, tables: fileManagerTables }),
  keyPrefix: process.env.S3_KEY_PREFIX, // e.g. prod/acme
  presign: {
    putExpiresInSeconds: 900,
    getExpiresInSeconds: 900,
  },
});
```

Environment (API only — never expose secret keys to Vite):

```bash
S3_BUCKET=my-app-uploads
AWS_REGION=ap-southeast-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_KEY_PREFIX=prod/tenant-123
```

---

## 3. Express

```ts
import { createFileManagerRouter } from "@eristack/file-manager/express";
import { requireAuth } from "./auth"; // your jwt/rbac

app.use("/files", requireAuth, createFileManagerRouter({ fileManager }));
```

Mount **after** body parser. Protect with `@eristack/jwt-auth` or your guard — the library does not authenticate uploads.

---

## 4. Vite client

Proxy `/files` to API (see `@eristack/jwt-auth` dual-target docs).

```ts
import {
  createFileManagerClient,
  uploadViaPresign,
} from "@eristack/file-manager/client";

const files = createFileManagerClient({
  baseUrl: "/files",
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${accessToken}`,
      },
    }),
});

// On file pick:
const stored = await uploadViaPresign({
  client: files,
  file,
  namespace: "invoices",
});
await db.update(invoices).set({ attachmentFileId: stored.id }).where(eq(invoices.id, invoiceId));
```

React: [`FileUploadDropzone`](./dev-tools.md) + TanStack Query hooks from `@eristack/file-manager/react`.

---

## 5. Serving downloads

When rendering an invoice:

```ts
const { url } = await fileManager.resolveDownloadUrl(invoice.attachmentFileId!);
// redirect or <a href={url}> — URL expires; regenerate on each view
```

---

## 6. Horizon A (optional)

```ts
import { registerFileManagerBackseat } from "@eristack/file-manager/backseat";

registerFileManagerBackseat(api, { basePath: "/files" });
```

See [Backseat](./backseat.md). Graduate to §2–4 for production.

---

## Checklist

Use [Production checklist](./production-checklist.md) before go-live.
