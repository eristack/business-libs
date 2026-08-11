---
name: jwt-auth-adapters
description: >
  @eristack/jwt-auth adapters: drizzle pgsql/mysql/sqlite RefreshTokenStore +
  CredentialStore (jwt_auth_credentials child of users), headless rest login/
  sessions, express createJwtAuthRouter, nest JwtAuthModule JwtAuthGuard, client
  createJwtAuthClient login, react JwtAuthProvider useJwtAuth. Use when wiring
  persistence or HTTP/frontend shells.
metadata:
  type: core
  library: '@eristack/jwt-auth'
  library_version: '0.0.0'
sources:
  - 'eristack/business-libs:packages/jwt-auth/docs/adapters.md'
  - 'eristack/business-libs:packages/jwt-auth/src/drizzle/table.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/drizzle/credentials-table.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/rest/actions.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/express/router.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/nest/module.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/client/create-client.ts'
  - 'eristack/business-libs:packages/jwt-auth/src/react/hooks.ts'
---

# @eristack/jwt-auth — Adapters

Layered adapters over the pure core. Import subpaths; do not reimplement refresh/login logic in Express/Nest/React.

## Setup

```ts
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createCredentialsTable,
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";
import { createJwtAuthRouter, createExpressRequireAuth } from "@eristack/jwt-auth/express";

// App owns `users`. Credentials table is a child (subject = user id), not `users`.
const refreshTokens = createRefreshTokenTable("pgsql"); // not "pg"
const credentialsTable = createCredentialsTable("pgsql"); // jwt_auth_credentials

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: createDrizzleRefreshTokenStore({ dialect: "pgsql", db, table: refreshTokens }),
  credentials: createDrizzleCredentialStore({
    dialect: "pgsql",
    db,
    table: credentialsTable,
  }),
});

app.use("/auth", createJwtAuthRouter({ jwtAuth: auth }));
app.get("/me", createExpressRequireAuth({ jwtAuth: auth }), (req, res) => {
  res.json({ subject: req.auth!.subject });
});
```

## Core Patterns

### Drizzle dialects

```ts
createRefreshTokenTable("pgsql" | "mysql" | "sqlite");
createCredentialsTable("pgsql" | "mysql" | "sqlite");
```

Dialect name is `pgsql`, not `pg`. Default credentials table: `jwt_auth_credentials`.

### Headless REST then framework shells

```ts
import { createRestActions, createRequireAuth } from "@eristack/jwt-auth/rest";
import { JwtAuthModule, JwtAuthGuard } from "@eristack/jwt-auth/nest";

const actions = createRestActions({
  jwtAuth: auth,
  refreshTokenTransport: "body-or-cookie",
});

// POST /auth/login, POST /auth/change-password
// GET /auth/sessions + DELETE /auth/sessions/:sessionId (Bearer access)
JwtAuthModule.register({ jwtAuth: auth });
```

Express/Nest only map req/res onto `/rest`. Business rules stay in core.

### Headless client + headless React

```ts
import {
  createJwtAuthClient,
  createLocalStorageTokenStorage,
} from "@eristack/jwt-auth/client";
import { JwtAuthProvider, useJwtAuth } from "@eristack/jwt-auth/react";

const client = createJwtAuthClient({
  baseUrl: () => appConfig.apiBaseUrl,
  storage: createLocalStorageTokenStorage(),
  getHeaders: () => ({ "X-Tenant": tenantId }),
});

function Profile() {
  const { status, login, ensureAccessToken, logout } = useJwtAuth();
  // await login({ username, password }) — package ships no forms
}
```

## Common Mistakes

### CRITICAL Name the credentials table `users`

Wrong:

```ts
createCredentialsTable("pgsql", "users");
```

Correct:

```ts
// App schema: users + jwt_auth_credentials (subject → users.id)
createCredentialsTable("pgsql");
```

### CRITICAL Use dialect `"pg"` instead of `"pgsql"`

Wrong:

```ts
createRefreshTokenTable("pg");
```

Correct:

```ts
createRefreshTokenTable("pgsql");
```

### HIGH Duplicate login/refresh handlers in Express instead of using `/rest`

Wrong:

```ts
app.post("/login", async (req, res) => {
  const pair = await auth.login(req.body);
  res.json(pair);
});
```

Correct:

```ts
app.use("/auth", createJwtAuthRouter({ jwtAuth: auth }));
```

### HIGH Ship React UI widgets from `@eristack/jwt-auth/react`

Wrong:

```ts
import { LoginForm } from "@eristack/jwt-auth/react";
```

Correct:

```ts
import { JwtAuthProvider, useJwtAuth } from "@eristack/jwt-auth/react";
// compose your own forms with useJwtAuth().login
```

### HIGH Let the package create DB connections or invent API hosts

Adapters accept instances or getters; they do not own infrastructure.

## See also

- `jwt-auth-core` — registerCredentials/login/issue/verify/refresh/revoke
