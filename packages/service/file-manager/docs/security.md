---
title: Security
description: Auth, CORS, bucket policy, presign limits, and secrets handling.
---

# Security

## Authentication

`@eristack/file-manager` **does not** authenticate HTTP routes. Your app must:

- Mount `createFileManagerRouter` **behind** JWT/RBAC middleware
- Pass `Authorization` from the browser client (`createFileManagerClient` custom `fetch`)
- Optionally set `ownerId` on presign body for audit (enforce match to session in your handler wrapper)

## AWS credentials

| Rule | Why |
| --- | --- |
| IAM user/role on **API only** | Secrets never ship to Vite bundles |
| Least privilege on bucket | `PutObject`, `GetObject`, `DeleteObject`, `HeadObject` on `bucket/prefix/*` |
| Prefer IAM role on ECS/Lambda/Vercel OIDC | No long-lived access keys in env |

## Presigned URLs

- Default TTL **15 minutes** — tune via `presign.putExpiresInSeconds` / `getExpiresInSeconds`
- `maxPresignBytes` on REST router (default 50 MiB) — lower for avatars, raise for imports with care
- Validate `mimeType` and `sizeBytes` server-side before signing — clients can lie; **completeUpload** verifies size via S3 HEAD

## CORS (S3 bucket)

Browser PUT to S3 requires bucket CORS allowing your web origin:

```xml
<CORSRule>
  <AllowedOrigin>https://app.example.com</AllowedOrigin>
  <AllowedMethod>PUT</AllowedMethod>
  <AllowedMethod>GET</AllowedMethod>
  <AllowedHeader>*</AllowedHeader>
</CORSRule>
```

API CORS is separate (Express) — presign returns URL; browser talks to S3 directly.

## Data exposure

- **Private buckets** + presigned GET — default pattern
- Do not store public object URLs in Postgres unless objects are intentionally public
- Soft-delete: `deleteFile` removes object + marks row `deleted` — hard-delete policy is app-owned

## Zod validation

Use `@eristack/file-manager/zod` at HTTP boundary or extend routes with your auth context checks.
