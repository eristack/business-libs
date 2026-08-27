---
name: optimistic-document-version
description: >
  Canon optimistic locking for ERP documents: version + expectedVersion,
  409 CONFLICT_VERSION — docs/recipe only, not a package. Distinct from epoch.
metadata:
  type: core
  library: '@eristack/ai-knowledge'
  library_version: '0.1.3'
sources:
  - 'eristack/business-libs:packages/ai/ai-knowledge/knowledge/optimistic-document-version.md'
---

# Optimistic document version

Read `knowledge/optimistic-document-version.md` only.

## Quick rules

- Aggregates carry `version`; PATCH sends `expectedVersion`.
- Mismatch → 409 `CONFLICT_VERSION` (`versionConflict()` / `BackseatVersionConflictError` from `@eristack/backseat`).
- SQL: `UPDATE … WHERE id = ? AND version = ?`.
- Epoch bumps cache — **not** write conflicts.

No `@eristack/concurrency` package unless maintainers add one later.
