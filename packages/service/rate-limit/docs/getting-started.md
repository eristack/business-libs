# Getting started

```bash
pnpm add @eristack/rate-limit
```

```ts
import { createRateLimiter } from "@eristack/rate-limit";

const limiter = createRateLimiter({ windowMs: 60_000, max: 100 });
const result = limiter.check(clientIp);
if (!result.allowed) {
  // 429 with Retry-After from result.resetAt
}
```

## Collaboration

**Memory limiter is for tests and single-instance dev.** Production: Redis or edge limiter in the app. First middleware in **`platform-api-guard`**.
