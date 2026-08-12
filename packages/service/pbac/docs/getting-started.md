---
title: Getting started
description: Register document policies and check()
sidebar_position: 3
---

# Getting started

```ts
import { createPbac, documents } from "@eristack/pbac";

const pbac = createPbac();

pbac.registerPolicy({
  id: "purchase-order.can-receive",
  evaluate: documents.positiveAmount("outstandingMinor"),
});

const decision = await pbac.check("purchase-order.can-receive", {
  document: { outstandingMinor: po.outstandingMinor },
});
```
