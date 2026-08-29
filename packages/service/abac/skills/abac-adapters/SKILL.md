---
name: abac-adapters
description: >
  @eristack/abac adapters: express createRequirePolicy, nest AbacModule +
  AbacGuard + RequirePolicy + AbacContextFactory, react usePolicy. Use when
  wiring attribute policy checks into HTTP/UI shells.
metadata:
  type: adapter
  library: '@eristack/abac'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/service/abac/docs/adapters.md'
---

# ABAC adapters

Load attributes in `getContext` / `AbacContextFactory` from your app stores.
Server must enforce; React `usePolicy` is UX only.

## Express

```ts
import { createRequirePolicy } from "@eristack/abac/express";

app.post(
  "/goods-receipts",
  requireAuth,
  createRequirePolicy({
    abac,
    policyId: "goods-receipt.book-value-limit",
    getContext: async (req) => ({
      subject: { id: req.auth!.subject!, attrs: await loadUserLimits(req.auth!.subject!) },
      resource: { type: "goods-receipt", attrs: { bookValueMinor: req.body.bookValueMinor } },
      action: "create",
    }),
  }),
  handler,
);
```

## Nest

```ts
import { AbacGuard, AbacModule, RequirePolicy } from "@eristack/abac/nest";

@Module({ imports: [AbacModule.forRoot({ abac, contextFactory })] })
export class AppModule {}

@RequirePolicy("goods-receipt.book-value-limit")
@UseGuards(AbacGuard)
@Post("goods-receipts")
create() {}
```

Guard order: auth → RBAC → ABAC → PBAC (409). See `docs/adapters.md`.
