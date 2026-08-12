---
title: Introduction
description: JWT access tokens, rotating opaque refresh tokens, and optional username/password credentials
sidebar_position: 1
---

# @eristack/jwt-auth

Every business app eventually needs the same five things: sign a user in, hand the frontend a short-lived token, keep that session alive without asking for the password again, show the user their active devices, and kill a session on demand. Most codebases grow that logic by accident — a `jsonwebtoken` call in a controller, a `sessions` table with a plaintext token column, a refresh endpoint nobody wrote tests for.

`@eristack/jwt-auth` is the canonical version of that flow. The core is pure business logic: no HTTP framework, no database driver, no environment reading, no UI. Adapters wrap it for Drizzle, REST, Express, Nest, browsers, and React — always by **injection**, never by inventing infrastructure.

## What it is

- **Access tokens** — HS256 JWTs signed with your secret, short TTL (default `15m`), stateless verification
- **Refresh tokens** — opaque random secrets, long TTL (default `30d`), stored as SHA-256 hashes, rotated on every use, with **family-wide revocation on reuse**
- **Optional credentials** — username + password hashed with scrypt, in a table that is a *child* of your users
- **Sessions** — active refresh tips per user, listable through [`@eristack/data-grid`](/docs/data-grid), revocable by id
- **Headless adapters** — Drizzle stores, framework-free REST actions, Express router, Nest module, browser client, React hooks

## What it is not

| Not this | Because |
| --- | --- |
| A `users` table | Your app owns users. Credentials attach to them by `subject`. |
| An identity provider | No OAuth server, no SAML, no email delivery, no MFA enrollment. |
| A UI kit | `/react` ships hooks and form *options* — zero widgets. |
| A config loader | You pass `accessSecret`, `baseUrl`, `db`. The package never reads `process.env`. |
| A DB connection manager | You create the Drizzle client; the store adapter receives it. |
| An authorization system | You get a verified `subject` and `claims`. Roles and policies are yours. |

> **The one rule to remember:** credentials are a **child of your users table**, not a replacement for it. `subject` is *your* application's user id. See [Concepts](./concepts.md#users-vs-credentials-vs-refresh-families).

## Layers

```text
@eristack/jwt-auth                      core — pure business logic
        │                               createJwtAuth: issue / verify / refresh
        │                               revoke / sessions / credentials
        │
        ├── /drizzle                    RefreshTokenStore + CredentialStore
        │                               (pgsql | mysql | sqlite tables)
        │
        ├── /rest                       framework-free actions + requireAuth
        │     ├── /express              createJwtAuthRouter + middleware
        │     └── /nest                 JwtAuthModule + guard + controller
        │
        └── /client                     HTTP + token state machine (no framework)
              └── /react                TanStack Query hooks over /client
```

Core never imports Express, Nest, React, or Drizzle. `/react` never calls `fetch` — it wraps `/client`.

## Two tokens, two jobs

| | Access token | Refresh token |
| --- | --- | --- |
| Form | Signed JWT (HS256) | Opaque random string (32 bytes, base64url) |
| Default TTL | `15m` | `30d` |
| Verified by | Signature + claims, no DB read | Lookup of its SHA-256 hash in your store |
| Server stores | Nothing | Hash, `familyId`, timestamps, optional claims |
| Sent as | `Authorization: Bearer …` | JSON body and/or `HttpOnly` cookie |
| Revocable | No (wait for expiry) | Yes — per token, per family, per user |

Keep access TTLs short precisely because they cannot be revoked. Everything revocable lives on the refresh side. [Tokens & refresh](./tokens-and-refresh.md) covers rotation and reuse detection in detail.

## A minute of code

```ts
import {
  createJwtAuth,
  createMemoryCredentialStore,
  createMemoryRefreshTokenStore,
} from "@eristack/jwt-auth";

const auth = createJwtAuth({
  accessSecret: appConfig.jwtAccessSecret, // ≥ 16 characters
  store: createMemoryRefreshTokenStore(),
  credentials: createMemoryCredentialStore(),
});

// Your app already inserted the user row:
await auth.registerCredentials({
  subject: user.id,
  username: "ada",
  password: "correct horse battery",
});

const tokens = await auth.login({ username: "ada", password: "correct horse battery" });
const { subject, claims } = await auth.verifyAccessToken(tokens.accessToken);
const rotated = await auth.refresh(tokens.refreshToken);
```

## Where to go next

| Guide | Read it when |
| --- | --- |
| [Getting started](./getting-started.md) | You want a working register → login → verify → refresh → revoke loop |
| [Concepts](./concepts.md) | You need the mental model: users, credentials, families, sessions |
| [Credentials](./credentials.md) | You are building signup, login, or change-password |
| [Tokens & refresh](./tokens-and-refresh.md) | You are implementing rotation, SSO issuance, or claims |
| [Sessions](./sessions.md) | You are building a "your devices" screen |
| [HTTP adapters](./http.md) | You are exposing routes with Express or Nest |
| [Database](./database.md) | You are writing migrations for refresh tokens and credentials |
| [Client & React](./client-and-react.md) | You are wiring a browser app or SPA |
| [Recipes](./recipes.md) | You want an end-to-end pattern to copy |
| [Security](./security.md) | Before you ship to production |

## Related packages

- [`@eristack/data-grid`](/docs/data-grid) — `listSessions` returns a `DataGridResult`, so device lists filter, sort, and paginate like every other list in your product.
