---
name: file-manager-core
description: >
  Pure @eristack/file-manager: createFileManager, FileRef JSON for DB columns,
  presigned upload sessions, server uploadFromServer, resolveDownloadUrl,
  buildObjectKey. S3 via @eristack/file-manager/s3. Memory driver tests only.
metadata:
  type: core
  library: "@eristack/file-manager"
  library_version: "0.1.0"
sources:
  - "eristack/business-libs:packages/service/file-manager/docs/getting-started.md"
---

# File manager core

## Defaults

- **Production:** S3 driver + Drizzle `file_manager_files` — never `createMemory*` in prod.
- Persist **`fileId` or `FileRef`** on entities — not presigned URLs.
- Browser flow: `beginPresignedUpload` → PUT to S3 → `completeUpload`.

## Minimal wiring

```ts
import { createFileManager } from "@eristack/file-manager";
import { createS3StorageDriver } from "@eristack/file-manager/s3";
import {
  createDrizzleFileRecordStore,
  createFileManagerTables,
} from "@eristack/file-manager/drizzle";

const fileManager = createFileManager({
  driver: createS3StorageDriver({ bucket, region }),
  store: createDrizzleFileRecordStore({
    db,
    tables: createFileManagerTables("pgsql"),
  }),
  keyPrefix: "prod/my-tenant",
});
```

## FileRef column

```ts
import { serializeFileRef, parseFileRef } from "@eristack/file-manager";
// column stores serializeFileRef(ref); read with parseFileRef(row.attachmentRef)
```

## Tests only

```ts
import {
  createMemoryStorageDriver,
  createMemoryFileRecordStore,
} from "@eristack/file-manager/testing";
```

Load `file-manager-adapters` for Express, client, React dev panel, and `@eristack/file-manager/backseat` for Horizon A.
