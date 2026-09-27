---
name: rounding-policy-core
description: >
  @eristack/rounding-policy createRoundingPolicyRegistry and roundingFor → money Rounding (Wave 13 F2).
metadata:
  author: eristack
  version: "0.0"
sources:
  - packages/capability/rounding-policy/docs/getting-started.md
---

# @eristack/rounding-policy

Register policies in app startup (or load from DB). At post/ledger boundary:

```ts
const op = registry.roundingFor({ policyId: company.defaultRoundingPolicyId, currency: "USD" });
money.with(op);
```

Never reimplement scale/mode lists — export policy ids from your tenant settings table.
