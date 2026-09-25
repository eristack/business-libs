---
name: http-errors
description: >
  Unified 409 JSON error envelope: CONFLICT_VERSION, POLICY_DENIED,
  BUSINESS_POLICY_DENIED, STALE_EPOCH. Backseat jsonError/versionConflict;
  Express mapDomainError. Distinct document version vs epoch cache.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/http-errors.md'
---

# HTTP error envelope

Read `knowledge/http-errors.md` only.

## Quick rules

- Body shape: `{ error: { code, message, details? } }`.
- **400** `INVALID_TIMESTAMP` — `TimestampParseError`; **400** `VALIDATION_ERROR` — Zod; **409** `CONFLICT_UNIQUE` — Postgres `23505`.
- **409** branches: `CONFLICT_VERSION` (merge UI), `BUSINESS_POLICY_DENIED` / `POLICY_DENIED` (toast reason), `STALE_EPOCH` (refetch list).
- Backseat: `jsonError`, `versionConflict`, `BackseatVersionConflictError`.
- Express/Nest: `createMapDomainError` / `createAsyncHandler` from `@eristack/backseat/express`; Nest `createDomainErrorExceptionFilter`.
- Document `version` ≠ `@eristack/epoch` — use both where needed.

Pair with `#optimistic-document-version` for PATCH handlers.
