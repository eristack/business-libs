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

// Role × Branch × Trade scope (list prefilter or policy)
abac.registerPolicy({
  id: "job.in-scope",
  evaluate: attrs.assignmentPairMatch({
    pairsPath: "subject.attrs.assignments",
    resourceBranchPath: "resource.attrs.branchId",
    resourceTradePath: "resource.attrs.trade",
  }),
});

// Pure helpers for executeBackseatList prefilter + Drizzle scope SQL
import { assignmentScopePrefilter, matchesAssignmentPair } from "@eristack/abac";
import { assignmentScopeWhere } from "@eristack/data-grid/drizzle";

assignmentScopePrefilter(user.assignments, doc); // empty assignments ⇒ false
matchesAssignmentPair(user.assignments, doc.branchId, doc.trade);
// SQL: .where(and(assignmentScopeWhere({ branchId, trade }, user.assignments), ...))
```

## Money in ABAC attrs

Use **integer minor units** (`bookValueMinor`) or **decimal strings** in attrs — never JS `number` literals for currency. Compare with `@eristack/money` at policy boundaries if you need same-currency arithmetic; ABAC itself only sees plain attrs on `subject` / `resource`.
