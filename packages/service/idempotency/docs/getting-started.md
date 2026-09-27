# Getting started

```bash
pnpm add @eristack/idempotency
```

```ts
import {
  createIdempotencyGuard,
  createMemoryIdempotencyStore,
} from "@eristack/idempotency";

const store = createMemoryIdempotencyStore(); // tests only — use Drizzle in prod
const guard = createIdempotencyGuard(store);

await guard.run(requestIdempotencyKey, async () => {
  return chargePayment();
});
```

## Collaboration

Wire on payment and comms POST routes after rate-limit and api-key (recipe **`platform-api-guard`**). Completed keys replay the stored JSON body without re-running side effects.
