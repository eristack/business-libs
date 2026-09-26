---
title: File Manager
description: S3 uploads, presigned URLs, FileRef for Drizzle, REST and React dev tools.
---

# @eristack/file-manager

Store blobs in **S3** (or a test memory driver), track metadata in **`file_manager_files`**, and persist **`FileRef`** JSON on your entities — not bare expiring URLs.

| Path | Use |
| --- | --- |
| `@eristack/file-manager` | `createFileManager`, `FileRef`, key helpers |
| `@eristack/file-manager/s3` | `createS3StorageDriver` |
| `@eristack/file-manager/drizzle` | tables + `createDrizzleFileRecordStore` |
| `@eristack/file-manager/express` | `createFileManagerRouter` |
| `@eristack/file-manager/client` | presign + `uploadViaPresign` |
| `@eristack/file-manager/react` | dropzone + `FileManagerDevPanel` |

Production: **Drizzle + Postgres + S3**. Memory driver/store is **tests only**.

Next: [Getting started](./getting-started.md).
