---
name: abac-core
description: >
  Pure @eristack/abac: createAbac, registerPolicy, evaluate/authorize, attrs
  helpers — attribute-based policies (algorithms with arguments → boolean). Use
  for per-user limits and scopes (e.g. max book value) beyond boolean RBAC.
metadata:
  type: core
  library: '@eristack/abac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/abac/docs/concepts.md'
  - 'eristack/business-libs:packages/service/abac/docs/getting-started.md'
---

# ABAC core

Policies are functions over `subject` / `resource` / `environment` attributes.

```ts
abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
  }),
});
```
