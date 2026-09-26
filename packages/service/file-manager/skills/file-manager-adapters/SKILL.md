---
name: file-manager-adapters
description: >
  @eristack/file-manager adapters: drizzle tables/store, REST + express
  createFileManagerRouter, client uploadViaPresign, react FileUploadDropzone
  and FileManagerDevPanel. Use when wiring S3 uploads in API and Vite apps.
metadata:
  type: adapters
  library: "@eristack/file-manager"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/file-manager/docs/getting-started.md"
---

# File manager adapters

## Express

```ts
import { createFileManagerRouter } from "@eristack/file-manager/express";

app.use("/files", createFileManagerRouter({ fileManager }));
```

Protect with your jwt/rbac middleware — library does not auth.

## Client presigned upload

```ts
import {
  createFileManagerClient,
  uploadViaPresign,
} from "@eristack/file-manager/client";

const client = createFileManagerClient({ baseUrl: "/files" });
const stored = await uploadViaPresign({ client, file, namespace: "invoices" });
```

## React dev UI

```tsx
import { FileManagerDevPanel } from "@eristack/file-manager/react";

<FileManagerDevPanel baseUrl="/files" namespace="dev" />;
```

## HTTP surface

See `docs/http.md`: `POST /uploads/presign`, `POST /uploads/complete`, `GET /:id/download-url`.

## Zod

`@eristack/file-manager/zod` — `presignUploadBodySchema`, `completeUploadBodySchema`, `fileRefSchema`.

## Backseat (Horizon A)

```ts
import { registerFileManagerBackseat } from "@eristack/file-manager/backseat";

registerFileManagerBackseat(api, { basePath: "/files" });
```

Memory blob driver + `fileManager.files` collection — not for production/Vercel.
