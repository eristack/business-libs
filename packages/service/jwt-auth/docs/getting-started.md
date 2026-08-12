---
title: Getting started
description: Install, wire memory stores, and run register → login → verify → refresh → revoke
sidebar_position: 2
---

# Getting started

This guide gets you from `pnpm add` to a complete session lifecycle in a single file. No database, no HTTP server — just the core, so the moving parts stay visible. Swap in Drizzle ([Database](./database.md)) and routes ([HTTP adapters](./http.md)) once the flow makes sense.

## Installation

```bash
pnpm add @eristack/jwt-auth
```

The core needs nothing else. Optional peers are pulled in only by the entry point you import:

| Entry | Peer you must already have |
| --- | --- |
| `@eristack/jwt-auth` | — (bundles `jose`) |
| `@eristack/jwt-auth/drizzle` | `drizzle-orm` + your driver |
| `@eristack/jwt-auth/rest` | — |
| `@eristack/jwt-auth/express` | `express` |
| `@eristack/jwt-auth/nest` | `@nestjs/common`, `@nestjs/core` |
| `@eristack/jwt-auth/client` | — (uses `fetch`) |
| `@eristack/jwt-auth/react` | `react`, `@tanstack/react-query`, `@tanstack/react-form` |

## Create the auth instance

`createJwtAuth` is the only factory in core. It takes a secret, a refresh-token store, and — if you want password login — a credential store.

```ts
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "@eristack/jwt-auth";

const auth = createJwtAuth({
  accessSecret: appConfig.jwtAccessSecret,
  store: createMemoryRefreshTokenStore(),
  credentials: createMemoryCredentialStore(),
  accessTokenTtl: "15m",
  refreshTokenTtl: "30d",
  issuer: "acme-erp",
});
```

| Option | Default | Notes |
| --- | --- | --- |
| `accessSecret` | *required* | `string` (≥ 16 characters) or `Uint8Array` key for HS256 |
| `store` | *required* | `RefreshTokenStore` — memory for tests, Drizzle in production |
| `credentials` | `undefined` | `CredentialStore`; required for `login` / `registerCredentials` / `changePassword` |
| `accessTokenTtl` | `"15m"` | `"30s"`, `"15m"`, `"2h"`, `"7d"`, or milliseconds |
| `refreshTokenTtl` | `"30d"` | same duration syntax |
| `issuer` | `undefined` | sets and verifies `iss` |
| `audience` | `undefined` | sets and verifies `aud` (string or array) |
| `defaultClaims` | `undefined` | merged into every access token |
| `clock` | system | inject `{ now(): Date }` in tests |

A short secret throws `ConfigurationError` immediately, so misconfiguration fails at boot rather than at the first login.

> **Memory stores are for tests and prototypes.** They lose every session on restart and do not work across processes. Move to [Drizzle stores](./database.md) before anyone else uses your app.

## Attach credentials to an existing user

Your application owns the `users` table. `registerCredentials` links a username and password to a user you already created — `subject` is that user's id.

```ts
const user = await db.insert(users).values({ id: "user_1", displayName: "Ada" }).returning();

await auth.registerCredentials({
  subject: user.id,       // your user id — never a jwt-auth-owned id
  username: "Ada ",       // trimmed and lowercased to "ada"
  password: "correct horse battery",  // ≥ 8 characters, scrypt-hashed
});
```

If the username is taken you get `UsernameTakenError`. If that subject already has credentials you get a `ConfigurationError` telling you to use `changePassword` — one credential row per user, by design. Details in [Credentials](./credentials.md).

## Log in

```ts
const tokens = await auth.login({
  username: "ada",
  password: "correct horse battery",
  claims: { role: "admin" },   // optional, merged into the access token
});
```

You get a `TokenPair`:

```ts
{
  accessToken: "eyJhbGciOiJIUzI1NiJ9…",
  refreshToken: "u3Yq…",                     // opaque, not a JWT
  accessTokenExpiresAt: Date,
  refreshTokenExpiresAt: Date,
  tokenType: "Bearer",
  sessionId: "9f2c…",                        // this device's refresh record id
}
```

Any wrong or unknown username, wrong password, or disabled credential raises the same `InvalidCredentialsError` — deliberately indistinguishable so attackers cannot enumerate usernames.

Not using passwords? Verify the user however you like (SSO, magic link, API key) and call `issueTokens({ subject, claims })` instead. See [Tokens & refresh](./tokens-and-refresh.md#issuing-without-a-password).

## Verify an access token

```ts
import { InvalidAccessTokenError } from "@eristack/jwt-auth";

try {
  const verified = await auth.verifyAccessToken(tokens.accessToken);
  verified.subject;         // "user_1"
  verified.claims.role;     // "admin"
  verified.claims.exp;      // numeric expiry
} catch (error) {
  if (error instanceof InvalidAccessTokenError) {
    // expired, tampered, wrong issuer/audience, or missing `sub`
  }
}
```

No database round-trip happens here. That is the point of a short TTL: verification is cheap, and revocation is handled on the refresh side.

## Refresh (rotation)

```ts
const next = await auth.refresh(tokens.refreshToken);
// next.refreshToken !== tokens.refreshToken — the old one is now dead
```

Every refresh mints a **new** refresh token in the same family and marks the previous one replaced. Presenting an already-used token is treated as theft: the whole family is revoked and `RefreshTokenReuseError` is thrown. Always store the token you just received and discard the old one.

## List and revoke sessions

```ts
const sessions = await auth.listSessions(user.id);
sessions.items;      // [{ id, familyId, createdAt, expiresAt }]
sessions.pageInfo;   // { mode: "offset", page, pageSize, total, … }

await auth.revokeSession({ sessionId: sessions.items[0]!.id, subject: user.id });
```

`listSessions` returns a [`DataGridResult`](/docs/data-grid), so the same filter/sort/paginate contract you use for orders works for devices. See [Sessions](./sessions.md).

## Revoke

```ts
await auth.revoke(next.refreshToken);      // log out this device
await auth.revokeAllForSubject(user.id);   // log out everywhere
```

`revoke` is idempotent — an unknown or already-revoked token resolves silently instead of throwing, which keeps logout endpoints simple.

## The whole loop

```ts
const auth = createJwtAuth({
  accessSecret: appConfig.jwtAccessSecret,
  store: createMemoryRefreshTokenStore(),
  credentials: createMemoryCredentialStore(),
});

await auth.registerCredentials({ subject: "user_1", username: "ada", password: "password123" });

const pair = await auth.login({ username: "ada", password: "password123" });
const me = await auth.verifyAccessToken(pair.accessToken);

const rotated = await auth.refresh(pair.refreshToken);
const sessions = await auth.listSessions(me.subject);

await auth.revokeSession({ sessionId: sessions.items[0]!.id, subject: me.subject });
```

## Then add the shells

You now have the whole business surface. Everything else is transport:

```ts
import { createJwtAuthRouter } from "@eristack/jwt-auth/express";

app.use(express.json());
app.use("/auth", createJwtAuthRouter({ jwtAuth: auth, refreshTokenTransport: "body" }));
```

That single mount gives you `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/logout-all`, `/auth/change-password`, `/auth/issue`, `GET /auth/sessions`, and `DELETE /auth/sessions/:sessionId`. The full route table lives in [HTTP adapters](./http.md).

## Run the examples

Two runnable apps in this repo show the app-side wiring end to end:

- **`examples/express`** — SQLite + Drizzle stores, app-owned `users` table, seeded `demo` / `password123` login, auth router mounted at `/auth`, plus a protected `/me`
- **`examples/react`** — `createJwtAuthClient` with `localStorage` storage, `JwtAuthProvider`, login form, live session list with revoke, and a data-grid orders panel

```bash
pnpm --filter @eristack/example-express dev
pnpm --filter @eristack/example-react dev
```

Prefer copying those over inventing a second wiring pattern.

## Next steps

- [Concepts](./concepts.md) — users vs credentials vs families, and why sessions are refresh tips
- [Credentials](./credentials.md) — signup, login, password changes, disabling
- [Tokens & refresh](./tokens-and-refresh.md) — rotation, reuse detection, claims
- [Security](./security.md) — read before production
