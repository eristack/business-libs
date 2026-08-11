---
name: jwt-auth-adapters
description: >
  @eristack/jwt-auth adapters: drizzle pgsql/mysql/sqlite RefreshTokenStore,
  headless rest actions createRequireAuth, express createJwtAuthRouter,
  nest JwtAuthModule JwtAuthGuard, client createJwtAuthClient, react
  JwtAuthProvider useJwtAuth. Use when wiring persistence or HTTP/frontend shells.
metadata:
  type: core
  library: '@eristack/jwt-auth'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/jwt-auth/docs/adapters.md'
  - 'eristack/business-libs:packages/jwt-auth/src/drizzle/table.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/rest/actions.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/express/router.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/nest/module.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/client/create-client.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/react/hooks.ts'
---

# @eristack/jwt-auth — Adapters

Layered adapters over the pure core. Import subpaths; do not reimplement refresh logic in Express/Nest/React.

## Setup

```ts
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createDrizzleRefreshTokenStore,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";
import { createJwtAuthRouter, createExpressRequireAuth } from "@eristack/jwt-auth/express";

const table = createRefreshTokenTable("pgsql"); // not "pg"
const store = createDrizzleRefreshTokenStore({ dialect: "pgsql", db, table });
const auth = createJwtAuth({ accessSecret: process.env.JWT_ACCESS_SECRET!, store });

app.use("/auth", createJwtAuthRouter({ jwtAuth: auth }));
app.get("/me", createExpressRequireAuth({ jwtAuth: auth }), (req, res) => {
  res.json({ subject: req.auth!.subject });
});
```

## Core Patterns

### Drizzle dialects

```ts
createRefreshTokenTable("pgsql");
createRefreshTokenTable("mysql");
createRefreshTokenTable("sqlite");
```

Dialect name is `pgsql`, not `pg`.

### Headless REST then framework shells

```ts
import { createRestActions, createRequireAuth } from "@eristack/jwt-auth/rest";
import { JwtAuthModule, JwtAuthGuard } from "@eristack/jwt-auth/nest";

const actions = createRestActions({
  jwtAuth: auth,
  refreshTokenTransport: "body-or-cookie",
});
const requireAuth = createRequireAuth({ jwtAuth: auth });

JwtAuthModule.register({ jwtAuth: auth });
// @UseGuards(JwtAuthGuard) on protected Nest routes
```

Express/Nest only map req/res onto `/rest`. Business rules stay in core.

### Headless client + headless React

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
  const { status, ensureAccessToken, logout } = useJwtAuth();
  // build your own UI — package ships no buttons/forms
}
```

After app-owned login, call `client.acceptTokenPair(pair)` or `client.issue(...)` if using the issue route.

## Common Mistakes

### CRITICAL Use dialect `"pg"` instead of `"pgsql"`

Wrong:

```ts
createRefreshTokenTable("pg");
```

Correct:

```ts
createRefreshTokenTable("pgsql");
```

Source: packages/jwt-auth/src/drizzle/table.ts

### HIGH Duplicate refresh/logout handlers in Express instead of using `/rest`

Wrong:

```ts
app.post("/refresh", async (req, res) => {
  const pair = await auth.refresh(req.body.refreshToken);
  res.json(pair);
});
```

Correct:

```ts
import { createJwtAuthRouter } from "@eristack/jwt-auth/express";

app.use("/auth", createJwtAuthRouter({ jwtAuth: auth }));
```

Source: packages/jwt-auth/docs/adapters.md

### HIGH Ship React UI widgets from `@eristack/jwt-auth/react`

Wrong:

```ts
import { LoginForm } from "@eristack/jwt-auth/react";
```

Correct:

```ts
import { JwtAuthProvider, useJwtAuth } from "@eristack/jwt-auth/react";
// compose your own forms with useJwtAuth()
```

`/react` is provider + hooks only.

Source: packages/jwt-auth/docs/adapters.md

### MEDIUM Import framework code from the root entry

Wrong:

```ts
import { createJwtAuthRouter } from "@eristack/jwt-auth";
```

Correct:

```ts
import { createJwtAuth } from "@eristack/jwt-auth";
import { createJwtAuthRouter } from "@eristack/jwt-auth/express";
```

Source: packages/jwt-auth/README.md

## See also

- `jwt-auth-core` — issue/verify/refresh/revoke and reuse detection
