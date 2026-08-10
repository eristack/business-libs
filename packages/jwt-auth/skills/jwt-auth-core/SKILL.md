---
name: jwt-auth-core
description: >
  Pure @eristack/jwt-auth token lifecycle: createJwtAuth, issueTokens,
  verifyAccessToken, refresh rotation, revoke, RefreshTokenStore, opaque
  refresh hashes, family reuse detection, RefreshTokenReuseError. Use when
  implementing JWT access + refresh without passwords/HTTP/DB frameworks.
metadata:
  type: core
  library: '@eristack/jwt-auth'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/jwt-auth/docs/index.md'
  - 'eristack/business-libs:packages/jwt-auth/docs/refresh-flow.md'
  - 'eristack/business-libs:packages/jwt-auth/src/core/create-jwt-auth.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/core/types.ts'
---

# @eristack/jwt-auth — Core Token Lifecycle

Business-only auth primitives. No HTTP, Drizzle, Express, Nest, or React in this entry. App authenticates the user, then calls `issueTokens`.

## Setup

```ts
import { createJwtAuth, createMemoryRefreshTokenStore } from "@eristack/jwt-auth";

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: createMemoryRefreshTokenStore(),
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
  issuer: "my-app",
});

const tokens = await auth.issueTokens({
  subject: user.id,
  claims: { role: user.role },
});
```

Use a real `RefreshTokenStore` (Drizzle) in production. Memory store is for tests/ephemeral use.

## Core Patterns

### Issue after app-owned credential check

```ts
// password / SSO / magic-link verification happens in YOUR code
const tokens = await auth.issueTokens({
  subject: "user_123",
  claims: { tenantId: "t1" },
});
// tokens.accessToken — short-lived JWT
// tokens.refreshToken — opaque secret (store only the hash server-side)
```

### Verify access tokens

```ts
const verified = await auth.verifyAccessToken(accessToken);
verified.subject; // "user_123"
verified.claims; // includes custom claims + sub/iat/exp
```

### Refresh with rotation

```ts
const next = await auth.refresh(previousRefreshToken);
// previous refresh is marked replaced; presenting it again is reuse
```

### Revoke sessions

```ts
await auth.revoke(refreshToken); // one session
await auth.revokeAllForSubject(userId); // all families for subject
```

## Common Mistakes

### CRITICAL Put password hashing or login inside jwt-auth core

Wrong:

```ts
await auth.login({ email, password });
```

Correct:

```ts
const user = await verifyPassword(email, password); // app-owned
const tokens = await auth.issueTokens({ subject: user.id });
```

Core only issues/verifies/refreshes/revokes tokens.

Source: packages/jwt-auth/docs/index.md

### CRITICAL Store refresh tokens in plaintext

Wrong:

```ts
await db.insert(sessions).values({ refreshToken: tokens.refreshToken });
```

Correct:

```ts
// RefreshTokenStore.save receives tokenHash from createJwtAuth
// Persist via createDrizzleRefreshTokenStore — never store the raw refresh secret
```

Only SHA-256 hashes are persisted by the store contract.

Source: packages/jwt-auth/docs/refresh-flow.md

### HIGH Treat rotated refresh reuse as a soft invalid token

Wrong:

```ts
try {
  await auth.refresh(oldRefresh);
} catch {
  // ignore and continue session
}
```

Correct:

```ts
import { RefreshTokenReuseError } from "@eristack/jwt-auth";

try {
  await auth.refresh(oldRefresh);
} catch (error) {
  if (error instanceof RefreshTokenReuseError) {
    // entire family already revoked — force re-login
  }
}
```

Reuse of a revoked/rotated refresh token revokes the whole family.

Source: packages/jwt-auth/docs/refresh-flow.md

### HIGH Put access JWT secrets and refresh TTL in HTTP adapters only

Wrong:

```ts
// configuring TTLs inside Express middleware only
```

Correct:

```ts
const auth = createJwtAuth({
  accessSecret,
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
  store,
});
// pass the same auth instance into rest/express/nest
```

Source: packages/jwt-auth/src/core/create-jwt-auth.ts

## See also

- `jwt-auth-adapters` — Drizzle dialects, REST, Express/Nest, client/React
