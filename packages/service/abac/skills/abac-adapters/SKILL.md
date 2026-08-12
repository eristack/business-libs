---
name: abac-adapters
description: >
  @eristack/abac adapters: express createRequirePolicy, nest AbacModule +
  AbacGuard + RequirePolicy + AbacContextFactory, react usePolicy. Use when
  wiring attribute policy checks into HTTP/UI shells.
metadata:
  type: adapter
  library: '@eristack/abac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/abac/docs/adapters.md'
---

# ABAC adapters

Load attributes in `getContext` / `AbacContextFactory` from your app stores.
Server must enforce; React `usePolicy` is UX only.
