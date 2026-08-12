# @eristack/pbac

Policy-based (software) access control: **business document rules** that return
true or false — usually **not** tied to a specific user.

```ts
import { createPbac, documents } from "@eristack/pbac";

const pbac = createPbac();

pbac.registerPolicy({
  id: "purchase-order.can-receive",
  evaluate: documents.positiveAmount(
    "outstandingMinor",
    "PO outstanding must be greater than 0",
  ),
});

await pbac.check("purchase-order.can-receive", {
  document: { id: po.id, outstandingMinor: po.outstandingMinor },
});
```

Use RBAC for who may try, ABAC for user attribute limits, PBAC for document laws.
