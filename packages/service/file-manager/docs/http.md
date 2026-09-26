---
title: HTTP
description: REST routes mounted by createFileManagerRouter.
---

# HTTP

Mount prefix example: `/files`.

| Method | Path | Body / query | Response |
| --- | --- | --- | --- |
| `POST` | `/uploads/presign` | `{ originalName, mimeType, sizeBytes, namespace?, ownerId? }` | presign session |
| `POST` | `/uploads/complete` | `{ fileId, checksumSha256? }` | stored file |
| `GET` | `/` | `?namespace=&status=` | `{ items: StoredFile[] }` |
| `GET` | `/:id` | — | stored file |
| `GET` | `/:id/download-url` | — | `{ url, expiresAt }` |
| `DELETE` | `/:id` | — | `204` |

Errors: JSON `{ code, message }` — `404` not found, `409` not ready / object missing, `400` validation.

Wire auth at the Express layer (jwt guard) before exposing `/files` in production. The library does not authenticate uploads.

Validate bodies with `@eristack/file-manager/zod` in your app if you extend routes.
