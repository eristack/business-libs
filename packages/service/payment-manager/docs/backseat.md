---
title: Backseat
description: Horizon A payment routes in the browser mock API.
---

# Backseat

```ts
import { registerPaymentManagerBackseat } from "@eristack/payment-manager/backseat";

registerPaymentManagerBackseat(api, { basePath: "/payments", gateway: "memory" });
```

Collections: `payment_manager_payment_intents`, `payment_manager_gateway_events`.

Uses memory driver by default. Pair with ERP demos the same way as `@eristack/file-manager/backseat`.
