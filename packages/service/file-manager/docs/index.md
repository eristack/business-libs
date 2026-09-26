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
| `@eristack/file-manager/backseat` | Horizon A `/files` on Backseat |
| `@eristack/file-manager/backseat/store` | IndexedDB metadata (`createIndexedDbFileManagerStores`) |

Production: **Drizzle + Postgres + S3**. Memory driver/store is **tests and Backseat prototypes only**.

## Read order

1. [Getting started](./getting-started.md) — minimal three-file wiring  
2. [Concepts](./concepts.md) — FileRef, lifecycle, entity patterns  
3. [Production wiring](./wiring-production.md) — Postgres + S3 + Express + Vite  
4. [Security](./security.md) + [Production checklist](./production-checklist.md) before go-live  

Adapters: [HTTP](./http.md) · [Dev tools (React)](./dev-tools.md) · [Backseat](./backseat.md)
