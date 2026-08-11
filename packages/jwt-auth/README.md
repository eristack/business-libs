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
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "@eristack/jwt-auth";

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: createMemoryRefreshTokenStore(), // swap for Drizzle in production
  credentials: createMemoryCredentialStore(), // optional; required for login
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
});

// App owns `users`. Attach credentials as a child (`subject` = user id):
await auth.registerCredentials({
  subject: user.id,
  username: "demo",
  password: "password123",
});
const tokens = await auth.login({ username: "demo", password: "password123" });

// SSO / magic-link / already-verified subjects can still use issueTokens:
const issued = await auth.issueTokens({
  subject: user.id,
  claims: { role: user.role },
});

const verified = await auth.verifyAccessToken(tokens.accessToken);
const rotated = await auth.refresh(tokens.refreshToken);
await auth.revoke(rotated.refreshToken);

// Device / session management (safe metadata only — no refresh secrets)
const sessions = await auth.listSessions(user.id);
await auth.revokeSession({ sessionId: sessions[0]!.id, subject: user.id });
```

The package stores **username + password hash** in `jwt_auth_credentials` (or your
name). It does **not** own a `users` table — credentials are always a child of
the app's users (`subject`).

HTTP routes (Express / Nest / REST): `POST /auth/login`, `POST /auth/change-password`,
`GET /auth/sessions`, `DELETE /auth/sessions/:sessionId` (Bearer where noted).

## AI agent skills

This package ships [Agent Skills](https://agentskills.io) via [TanStack Intent](https://tanstack.com/intent):

- `@eristack/jwt-auth#jwt-auth-core` — token lifecycle and reuse detection
- `@eristack/jwt-auth#jwt-auth-adapters` — Drizzle / REST / Express / Nest / client / React

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest load @eristack/jwt-auth#jwt-auth-core
```

## Drizzle

```ts
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createCredentialsTable,
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";

// App schema also defines `users`; credentials.subject → users.id
const refreshTokens = createRefreshTokenTable("pgsql"); // "pgsql" | "mysql" | "sqlite"
const credentialsTable = createCredentialsTable("pgsql"); // default: jwt_auth_credentials

const auth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: createDrizzleRefreshTokenStore({ dialect: "pgsql", db, table: refreshTokens }),
  credentials: createDrizzleCredentialStore({
    dialect: "pgsql",
    db,
    table: credentialsTable,
  }),
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

// Nest — inject DB/config via registerAsync when needed
JwtAuthModule.register({ jwtAuth: auth });
// JwtAuthModule.registerAsync({ inject: [DRIZZLE], useFactory: (db) => ({ jwtAuth: ... }) })
// then @UseGuards(JwtAuthGuard)
```

## Headless client + React

Inject host + storage (string or getters). The package does not read env or invent URLs.

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

function App() {
  return (
    <JwtAuthProvider client={client}>
      <Profile />
    </JwtAuthProvider>
  );
}

// or: <JwtAuthProvider clientConfig={{ baseUrl, storage }} />

function Profile() {
  const { status, accessToken, ensureAccessToken, logout } = useJwtAuth();
  // render your own UI — this package ships no buttons/forms
}
```

## Docs

- **Source of truth:** [`docs/`](./docs/)
- **Website:** rendered by [`apps/web`](../../apps/web) at `/docs/jwt-auth` (Cmd/Ctrl+K search on the site)

- [Overview](./docs/index.md)
- [Refresh-token flow](./docs/refresh-flow.md)
- [Adapters](./docs/adapters.md)

