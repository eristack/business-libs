# @eristack/payment-instrument

Token-safe card and debit instrument types — gateway refs + display metadata only.

```ts
import { toPersistable } from "@eristack/payment-instrument";

const row = toPersistable({
  display: { last4: "4242", brand: "visa", funding: "credit", expMonth: 12, expYear: 2030 },
  gateway: { gateway: "stripe", tokenId: "pm_123" },
});
```

Docs: [packages/primitive/payment-instrument/docs/index.md](./docs/index.md)
