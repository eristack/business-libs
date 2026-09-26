---
title: Production checklist
description: Pre-launch verification for S3 uploads and file metadata.
---

# Production checklist

Before shipping file uploads to production:

## Storage

- [ ] S3 bucket in same region as API (or acceptable latency)
- [ ] Block public access enabled; access via presigned URLs only
- [ ] CORS allows PUT/GET from production web origin
- [ ] IAM scoped to `arn:aws:s3:::bucket/prefix/*`
- [ ] `keyPrefix` includes tenant/environment segment

## Database

- [ ] Migration applied for `file_manager_files`
- [ ] App entity uses `fileId` FK or validated `FileRef` JSON — not bare URLs
- [ ] Backups include metadata table

## API

- [ ] `/files` behind authentication
- [ ] `maxPresignBytes` aligned with product (avatars vs bulk import)
- [ ] Errors use your standard envelope where wrapped
- [ ] Rate limit presign endpoint if exposed to anonymous-adjacent traffic

## Client

- [ ] Upload uses presign → PUT → complete (or server upload for generated files)
- [ ] Download uses fresh `resolveDownloadUrl` / `GET /:id/download-url`
- [ ] Failed PUT does not call `completeUpload`

## Operations

- [ ] Lifecycle rules (optional): expire incomplete multipart uploads
- [ ] Monitoring: 4xx/5xx on `/files`, S3 403 spikes
- [ ] Runbook: rotate IAM keys / role without dropping in-flight presigns (wait TTL)

## Tests

- [ ] Integration tests use `@eristack/file-manager/testing` — not memory in prod config
- [ ] Staging bucket separate from production

Horizon A: Backseat memory driver is **not** this checklist — see [Backseat](./backseat.md).
