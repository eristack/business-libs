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

```ts
import { createPbac, documents } from "@eristack/pbac";
import { createRequireBusinessPolicy } from "@eristack/pbac/express";
import { PbacModule, PbacGuard, RequireBusinessPolicy } from "@eristack/pbac/nest";

const pbac = createPbac();
pbac.registerPolicy({
  id: "order.transition",
  evaluate: documents.transitions("status", {
    draft: ["submit"],
    submitted: ["approve", "cancel"],
  }),
});

app.patch(
  "/orders/:id",
  createRequireBusinessPolicy({
    pbac,
    policyId: "order.transition",
    getInput: (req) => ({
      document: req.body,
      action: req.body.action,
    }),
  }),
  handler,
);

@RequireBusinessPolicy("order.transition")
@UseGuards(PbacGuard)
@Patch(":id")
transition() {}
```

Load document state in `getInput` / `PbacInputFactory`. Deny → **409** `{ error: { code: "POLICY_DENIED" } }`.
