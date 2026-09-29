---
title: Getting started
description: Normalize phone/email with @eristack/phone / @eristack/email-address before passing strings here.
---

# Getting started

```ts
import { normalizeContactList, primaryContact } from "@eristack/contact";

const list = normalizeContactList({
  channels: [{ role: "general", phone: "+14155550100", isPrimary: true }],
});
primaryContact(list);
```

Normalize phone/email with `@eristack/phone` / `@eristack/email-address` **before** passing strings here.
