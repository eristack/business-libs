---
title: Getting started
description: Register and evaluate attribute policies
sidebar_position: 3
---

# Getting started

```ts
import { createAbac, attrs } from "@eristack/abac";

const abac = createAbac();

abac.registerPolicy({
  id: "goods-receipt.book-value-limit",
  evaluate: attrs.subjectLimitAtLeastResource({
    subjectPath: "subject.attrs.maxBookValueMinor",
    resourcePath: "resource.attrs.bookValueMinor",
  }),
});

const decision = await abac.evaluate("goods-receipt.book-value-limit", {
  subject: { id: "user_1", attrs: { maxBookValueMinor: 5_000_000 } },
  resource: { type: "goods-receipt", attrs: { bookValueMinor: 1_200_000 } },
  action: "create",
});

decision.allowed; // true
```

Policies are **code-registered** (functions are not serialized to SQL). Persist
user attribute values in your app tables; pass them in `ctx.subject.attrs`.
