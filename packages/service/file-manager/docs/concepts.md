---
title: Concepts
description: FileRef, upload lifecycle, storage driver, and how apps attach files to entities.
---

# Concepts

## Responsibilities

| Layer | Owns |
| --- | --- |
| **Object storage (S3, MinIO, R2)** | Bytes, durability, IAM |
| **`@eristack/file-manager`** | Keys, presign, metadata rows, HTTP/React shells |
| **Your app** | Business entities, auth on `/files`, FK columns |

The library never opens AWS credentials in the browser — only **presigned URLs** for PUT/GET.

## Upload lifecycle

```text
beginPresignedUpload  →  status: pending  →  client PUT to S3
        ↓
completeUpload (head object)  →  status: ready
        ↓
resolveDownloadUrl  →  short-lived GET URL
```

Server-side uploads skip `pending`: `uploadFromServer` writes bytes and marks `ready` immediately.

## FileRef (v1)

Canonical JSON stored in `ref_json` or embedded on app rows:

| Field | Role |
| --- | --- |
| `provider` | `s3` · `memory` (tests/backseat) · `local` (reserved) |
| `bucket` | S3 bucket name |
| `key` | Object key (`{prefix}/{namespace}/{yyyy}/{mm}/{id}{ext}`) |
| `mimeType` | Content-Type |
| `sizeBytes` | Size after complete (from HEAD) |
| `originalName` | Display / download filename |
| `checksumSha256` | Optional; server upload sets by default |

**Do not** persist presigned URLs — they expire. Persist **`fileId`** or **`FileRef`**.

## Entity attachment patterns

**Pattern A — FK (recommended)**

```ts
invoice.attachmentFileId → file_manager_files.id
```

Use when you need list/delete/audit via the file API.

**Pattern B — embedded ref**

```ts
invoice.attachmentRef: FileRef JSON
```

Use for read-mostly pointers when metadata table is overkill.

## Namespaces

Logical grouping (`invoices`, `avatars`, `imports`) — not S3 buckets. One bucket per environment; namespaces appear in object keys and filter list APIs.

## Drivers

| Driver | Use |
| --- | --- |
| `createS3StorageDriver` | Production |
| `createMemoryStorageDriver` | Vitest, Backseat blob bytes |
| `createBackseatFileRecordStore` | Horizon A metadata in IndexedDB |

See [S3 and presigned](./s3-and-presigned.md) · [Database](./database.md).
