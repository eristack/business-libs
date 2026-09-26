---
title: Getting started
description: Wire S3, Drizzle, Express, and a browser upload in three files.
---

# Getting started

## Install

```bash
pnpm add @eristack/file-manager @aws-sdk/client-s3 @aws-sdk/s3-request-presigner drizzle-orm
```

S3 SDK is a **peer** of `@eristack/file-manager/s3` — install both in the API app.

## 1. API — file manager instance

```ts
import { createFileManager } from "@eristack/file-manager";
import { createS3StorageDriver } from "@eristack/file-manager/s3";
import {
  createDrizzleFileRecordStore,
  createFileManagerTables,
} from "@eristack/file-manager/drizzle";

const tables = createFileManagerTables("pgsql", "file_manager");

export const fileManager = createFileManager({
  driver: createS3StorageDriver({
    bucket: process.env.S3_BUCKET!,
    region: process.env.AWS_REGION!,
  }),
  store: createDrizzleFileRecordStore({ db, tables }),
  keyPrefix: process.env.S3_KEY_PREFIX, // e.g. prod/acme
});
```

Run a migration for `file_manager_files` (see [Database](./database.md)).

## 2. Express routes

```ts
import { createFileManagerRouter } from "@eristack/file-manager/express";

app.use("/files", createFileManagerRouter({ fileManager }));
```

## 3. Browser upload (presigned)

```ts
import { createFileManagerClient, uploadViaPresign } from "@eristack/file-manager/client";

const client = createFileManagerClient({ baseUrl: "/files" });

async function onPick(file: File) {
  const stored = await uploadViaPresign({
    client,
    file,
    namespace: "invoices",
  });
  // Persist stored.id or stored.ref on your invoice row
}
```

Or use [`FileUploadDropzone`](./dev-tools.md) from `@eristack/file-manager/react`.

## Flows

| Flow | When |
| --- | --- |
| **Presigned PUT** | Large files, direct browser → S3, API never buffers bytes |
| **Server `uploadFromServer`** | Generated PDFs, imports, webhooks with body already in memory |
| **`resolveDownloadUrl`** | Short-lived GET for private buckets |

Always call **`completeUpload`** after a successful presigned PUT so metadata moves from `pending` → `ready`.

## Backseat prototype

```ts
import { registerFileManagerBackseat } from "@eristack/file-manager/backseat";

registerFileManagerBackseat(api, { basePath: "/files" });
```

Details: [Backseat](./backseat.md).
