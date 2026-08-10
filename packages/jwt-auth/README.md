# @eristack/jwt-auth

Canonical JWT access-token + opaque refresh-token primitives for ERP and business apps.

- Pure core (no HTTP, no DB, no framework)
- Refresh rotation with family reuse detection
- Drizzle adapters for `pgsql` / `mysql` / `sqlite`
- Headless REST actions + Express / Nest shells
- Headless browser client + headless React bindings

## Install

```bash
pnpm add @eristack/jwt-auth
# optional peers depending on entry:
# drizzle-orm | express | @nestjs/common @nestjs/core | react
```

## Export map

| Import | Purpose |
| --- | --- |
| `@eristack/jwt-auth` | Issue / verify / refresh / revoke |
| `@eristack/jwt-auth/drizzle` | Dialect table + `RefreshTokenStore` |
| `@eristack/jwt-auth/rest` | Headless REST actions + `createRequireAuth` |
| `@eristack/jwt-auth/express` | Express router + middleware |
| `@eristack/jwt-auth/nest` | Nest module + guard + controller |
| `@eristack/jwt-auth/client` | Headless frontend client |
| `@eristack/jwt-auth/react` | Headless React provider/hooks (no UI) |

## Core

```ts
import { createJwtAuth, createMemoryRefreshTokenStore } from "@eristack/jwt-auth";

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: createMemoryRefreshTokenStore(), // swap for Drizzle in production
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
});

// After YOUR app verifies credentials:
const tokens = await auth.issueTokens({
  subject: user.id,
  claims: { role: user.role },
});

const verified = await auth.verifyAccessToken(tokens.accessToken);
const rotated = await auth.refresh(tokens.refreshToken);
await auth.revoke(rotated.refreshToken);
```

Credential checking / password hashing is intentionally out of scope.

## Drizzle

```ts
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createDrizzleRefreshTokenStore,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";

const refreshTokens = createRefreshTokenTable("pgsql"); // "pgsql" | "mysql" | "sqlite"
const store = createDrizzleRefreshTokenStore({
  dialect: "pgsql",
  db,
  table: refreshTokens,
});

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store,
});
```

## Headless REST → Express / Nest

```ts
import { createRestActions, createRequireAuth } from "@eristack/jwt-auth/rest";
import { createJwtAuthRouter, createExpressRequireAuth } from "@eristack/jwt-auth/express";
import { JwtAuthModule, JwtAuthGuard } from "@eristack/jwt-auth/nest";

const actions = createRestActions({ jwtAuth: auth, refreshTokenTransport: "body-or-cookie" });
const requireAuth = createRequireAuth({ jwtAuth: auth });

// Express
app.use("/auth", createJwtAuthRouter({ jwtAuth: auth }));
app.get("/me", createExpressRequireAuth({ jwtAuth: auth }), (req, res) => {
  res.json({ subject: req.auth!.subject });
});

// Nest
JwtAuthModule.register({ jwtAuth: auth });
// then @UseGuards(JwtAuthGuard)
```

## Headless client + React

```ts
import { createJwtAuthClient } from "@eristack/jwt-auth/client";
import { JwtAuthProvider, useJwtAuth } from "@eristack/jwt-auth/react";

const client = createJwtAuthClient({ baseUrl: "https://api.example.com" });

function App() {
  return (
    <JwtAuthProvider client={client}>
      <Profile />
    </JwtAuthProvider>
  );
}

function Profile() {
  const { status, accessToken, ensureAccessToken, logout } = useJwtAuth();
  // render your own UI — this package ships no buttons/forms
}
```

## Docs

- [Overview](./docs/index.md)
- [Refresh-token flow](./docs/refresh-flow.md)
- [Adapters](./docs/adapters.md)
