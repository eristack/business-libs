---
name: pbac-adapters
description: >
  @eristack/pbac adapters: express createRequireBusinessPolicy (409 on deny),
  nest PbacModule + PbacGuard + RequireBusinessPolicy, react useBusinessPolicy.
  Use when wiring document software policies into HTTP/UI shells.
metadata:
  type: adapter
  library: '@eristack/pbac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/pbac/docs/adapters.md'
---

# PBAC adapters

Load the document in `getInput` / `PbacInputFactory`. Deny responses use 409 Conflict.
