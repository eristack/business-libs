---
title: Database
description: file_manager_files table and how to store FileRef on entity rows.
---

# Database

## Metadata table (library-owned)

`createFileManagerTables("pgsql")` creates **`file_manager_files`**:

| Column | Role |
| --- | --- |
| `id` | UUID primary key returned to clients |
| `status` | `pending` · `ready` · `deleted` |
| `namespace` | Logical bucket (`invoices`, `avatars`, …) |
| `owner_id` | Optional app subject (user id) |
| `ref_json` | Canonical [`FileRef`](../index.md) JSON |
| timestamps | audit + `ready_at` |

Production: **`createDrizzleFileRecordStore`** — do not use `createMemoryFileRecordStore` outside unit tests.

## Entity columns (app-owned)

**Recommended:** FK to `file_manager_files.id` when you need list/delete/audit via the file API.

```ts
// Drizzle on your invoices table
attachmentFileId: text("attachment_file_id"),
```

**Embed pointer** when the row only needs a stable storage key + display name:

```ts
import type { FileRef } from "@eristack/file-manager";

attachmentRef: text("attachment_ref").$type<FileRef>(),
```

Persist with `serializeFileRef(ref)` or store `fileId` and resolve at read time.

### Rules

1. **Never** store only a presigned URL — it expires.
2. Store **`FileRef` or `fileId`**, then call `resolveDownloadUrl` when serving downloads.
3. Money/doc fields stay string-first; file fields are **`FileRef` v1** JSON or UUID FK.

See `fileRefColumnHelpers()` in `@eristack/file-manager/drizzle` for to/from driver helpers.
