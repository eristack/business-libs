---
title: Production wiring
description: End-to-end Drizzle + Express + React path for jwt-auth
sidebar_position: 3
---

# Production wiring — `@eristack/jwt-auth`

Complete path from install to logged-in React client against Postgres. **Memory stores are tests only** — never ship `createMemory*Store` to Vercel or multi-instance servers.

Skill: `@eristack/jwt-auth#jwt-auth-adapters` · Runnable reference: `examples/express`, `examples/react`.

---

## Install and peers

```bash
pnpm add @eristack/jwt-auth jose
pnpm add drizzle-orm postgres   # production default: pgsql dialect
# dev/test only:
pnpm add -D better-sqlite3      # sqlite dialect for local Vitest
```

| Entry | Peer |
| --- | --- |
| `@eristack/jwt-auth` | — (bundles `jose`) |
| `@eristack/jwt-auth/drizzle` | `drizzle-orm` + driver |
| `@eristack/jwt-auth/express` | `express` |
| `@eristack/jwt-auth/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/jwt-auth/client` | — |
| `@eristack/jwt-auth/react` | `react`, `@tanstack/react-query`, `@tanstack/react-form` |
| `@eristack/jwt-auth/backseat` | `@eristack/backseat` (Horizon A only) |

Dialect name is always **`"pgsql"`** (not `"pg"`).

---

## 1. Schema — app owns users, library owns credentials

```ts
// src/db/schema.ts
import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import {
  createCredentialsTable,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";

/** App-owned — jwt-auth never writes here except via your code. */
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const jwtAuthCredentials = createCredentialsTable("pgsql");
export const jwtAuthRefreshTokens = createRefreshTokenTable("pgsql");
```

Migration — add FK yourself:

```sql
ALTER TABLE jwt_auth_credentials
  ADD CONSTRAINT jwt_auth_credentials_subject_fkey
  FOREIGN KEY (subject) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE jwt_auth_refresh_tokens
  ADD CONSTRAINT jwt_auth_refresh_tokens_subject_fkey
  FOREIGN KEY (subject) REFERENCES users (id) ON DELETE CASCADE;

CREATE INDEX jwt_auth_refresh_tokens_subject_idx ON jwt_auth_refresh_tokens (subject);
```

Run `drizzle-kit generate` / `migrate` with your app migration pipeline.

---

## 2. Core factory (Drizzle stores)

```ts
// src/auth/create-auth.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
} from "@eristack/jwt-auth/drizzle";
import { jwtAuthCredentials, jwtAuthRefreshTokens } from "../db/schema.js";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool);

export const jwtAuth = createJwtAuth({
  accessSecret: process.env.JWT_ACCESS_SECRET!, // ≥ 16 chars
  store: createDrizzleRefreshTokenStore({
    dialect: "pgsql",
    db,
    table: jwtAuthRefreshTokens,
  }),
  credentials: createDrizzleCredentialStore({
    dialect: "pgsql",
    db,
    table: jwtAuthCredentials,
  }),
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
  issuer: "acme-erp",
});
```

Register credentials **after** you create the user row:

```ts
const [user] = await db.insert(users).values({ id, displayName, email }).returning();
await jwtAuth.registerCredentials({ subject: user.id, username, password });
```

---

## 3. Express mount

```ts
// src/server.ts
import express from "express";
import cors from "cors";
import {
  createExpressRequireAuth,
  createJwtAuthRouter,
  type AuthedRequest,
} from "@eristack/jwt-auth/express";
import { jwtAuth } from "./auth/create-auth.js";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(express.json());

app.use(
  "/auth",
  createJwtAuthRouter({
    jwtAuth,
    refreshTokenTransport: "body", // or "cookie" + httpOnly
  }),
);

const requireAuth = createExpressRequireAuth({ jwtAuth });

app.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ subject: req.auth!.subject, claims: req.auth!.claims });
});

app.listen(3001);
```

Routes mounted at `/auth`:

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/login` | Username/password → token pair |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke current refresh |
| POST | `/auth/logout-all` | Revoke all sessions |
| POST | `/auth/change-password` | Authenticated password change |
| POST | `/auth/issue` | Admin/issue without password |
| GET | `/auth/sessions` | Data-grid session list |
| DELETE | `/auth/sessions/:sessionId` | Revoke one device |

---

## 4. NestJS module

```ts
import { Module } from "@nestjs/common";
import { JwtAuthModule } from "@eristack/jwt-auth/nest";
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
} from "@eristack/jwt-auth/drizzle";

@Module({
  imports: [
    JwtAuthModule.registerAsync({
      inject: [APP_DATABASE],
      useFactory: (appDb) => ({
        jwtAuth: createJwtAuth({
          accessSecret: process.env.JWT_ACCESS_SECRET!,
          store: createDrizzleRefreshTokenStore({
            dialect: "pgsql",
            db: appDb.db,
            table: appDb.refreshTokenTable,
          }),
          credentials: createDrizzleCredentialStore({
            dialect: "pgsql",
            db: appDb.db,
            table: appDb.credentialsTable,
          }),
        }),
        refreshTokenTransport: "body",
      }),
    }),
  ],
})
export class AppModule {}
```

Protect routes with `@UseGuards(JwtAuthGuard)` from `@eristack/jwt-auth/nest`.

---

## 5. React client

```tsx
// src/main.tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createJwtAuthClient,
  createLocalStorageTokenStorage,
} from "@eristack/jwt-auth/client";
import { JwtAuthProvider } from "@eristack/jwt-auth/react";

const authClient = createJwtAuthClient({
  baseUrl: import.meta.env.VITE_API_URL, // same paths as Express /auth
  storage: createLocalStorageTokenStorage("acme"),
  credentials: "include",
});

const queryClient = new QueryClient();

root.render(
  <QueryClientProvider client={queryClient}>
    <JwtAuthProvider client={authClient}>
      <App />
    </JwtAuthProvider>
  </QueryClientProvider>,
);
```

Authenticated fetch wrapper:

```ts
const token = await authClient.ensureAccessToken();
const res = await fetch(`${apiUrl}/orders`, {
  headers: { Authorization: `Bearer ${token}` },
});
```

Horizon A → B: only change `VITE_API_URL` — paths stay `/auth/login`, etc.

---

## 6. Sessions list (data-grid)

`listSessions` returns `{ items, pageInfo, query }` — wire with `@eristack/data-grid` on the client or expose via your own route. See [Sessions](./sessions.md).

---

## 7. Testing subpath note

Production uses Drizzle stores above. For unit tests, prefer **`@eristack/jwt-auth/testing`** when exported, or construct stores inline:

```ts
import {
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "@eristack/jwt-auth"; // tests ONLY — not production exports long-term
```

Package tests use memory stores for speed. **Do not** import memory stores in `src/server.ts` or Nest `AppModule`.

Integration tests: sqlite Drizzle + `dialect: "sqlite"` mirrors production query paths — see `examples/express`.

---

## 8. Security checklist

- [ ] `JWT_ACCESS_SECRET` ≥ 16 characters, rotated via env/secrets manager
- [ ] FK from credentials/refresh → `users.id`
- [ ] HTTPS in production; `Secure` cookie if using cookie transport
- [ ] Rate-limit `/auth/login`
- [ ] Read [Security](./security.md) before go-live

---

## 9. Horizon A (Backseat) → same client

```ts
import { registerJwtAuthBackseat } from "@eristack/jwt-auth/backseat";

registerJwtAuthBackseat(api, { jwtAuth, basePath: "/auth" });
```

React client unchanged — point `baseUrl` at Backseat shim until Express is ready. See [Dual target](./dual-target.md).

---

## Related

- [Getting started](./getting-started.md) — core loop without HTTP
- [Database](./database.md) — column reference
- [HTTP adapters](./http.md) — full route table
- [Client & React](./client-and-react.md) — hooks and TanStack Form
