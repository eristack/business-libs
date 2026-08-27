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
- **409** branches: `CONFLICT_VERSION` (merge UI), `BUSINESS_POLICY_DENIED` / `POLICY_DENIED` (toast reason), `STALE_EPOCH` (refetch list).
- Backseat: `jsonError`, `versionConflict`, `BackseatVersionConflictError`.
- Document `version` ≠ `@eristack/epoch` — use both where needed.

Pair with `#optimistic-document-version` for PATCH handlers.
