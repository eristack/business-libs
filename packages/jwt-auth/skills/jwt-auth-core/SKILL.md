---
name: jwt-auth-core
description: >
  Pure @eristack/jwt-auth token + credentials lifecycle: createJwtAuth,
  registerCredentials, login, changePassword, issueTokens, verifyAccessToken,
  refresh rotation, revoke, CredentialStore, RefreshTokenStore, opaque refresh
  hashes, family reuse detection. Use when implementing JWT access + refresh
  and optional username/password without HTTP/DB frameworks.
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

Business-only auth primitives. No HTTP, Drizzle, Express, Nest, or React in this entry.

## Setup

```ts
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "@eristack/jwt-auth";

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: createMemoryRefreshTokenStore(),
  credentials: createMemoryCredentialStore(), // required for login
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
  issuer: "my-app",
});
```

Use Drizzle stores in production. Memory stores are for tests/ephemeral use.

## Core Patterns

### Credentials are a child of app users

```ts
// App inserts into `users` first
await db.insert(users).values({ id: userId, … });

// Then attach login credentials (subject = user id) — NOT a users table
await auth.registerCredentials({
  subject: userId,
  username: "demo",
  password: "password123",
});

const tokens = await auth.login({ username: "demo", password: "password123" });
```

Default table name via Drizzle helper: `jwt_auth_credentials`. Never name it `users`.

### Issue without password (SSO / magic link)

```ts
const tokens = await auth.issueTokens({
  subject: "user_123",
  claims: { tenantId: "t1" },
});
```

### Verify / refresh / revoke

```ts
const verified = await auth.verifyAccessToken(accessToken);
const next = await auth.refresh(previousRefreshToken);
await auth.revoke(refreshToken);
await auth.revokeAllForSubject(userId);
const sessions = await auth.listSessions(userId);
await auth.revokeSession({ sessionId: sessions[0]!.id, subject: userId });
```

## Common Mistakes

### CRITICAL Put credentials in a `users` table owned by jwt-auth

Wrong:

```ts
createCredentialsTable("pgsql", "users");
```

Correct:

```ts
// App owns `users`. Credentials are a child via subject.
createCredentialsTable("pgsql"); // jwt_auth_credentials
await auth.registerCredentials({ subject: user.id, username, password });
```

Source: packages/jwt-auth/docs/index.md

### CRITICAL Store refresh tokens or passwords in plaintext

Wrong:

```ts
await db.insert(sessions).values({ refreshToken: tokens.refreshToken });
await db.insert(creds).values({ password: plain });
```

Correct:

```ts
// RefreshTokenStore persists SHA-256 hashes only
// CredentialStore persists scrypt hashes from hashPassword / registerCredentials
```

### HIGH Treat rotated refresh reuse as a soft invalid token

Wrong:

```ts
try {
  await auth.refresh(oldRefresh);
} catch {
  // ignore
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

## See also

- `jwt-auth-adapters` — Drizzle dialects, REST, Express/Nest, client/React
