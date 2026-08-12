---
title: Adapters
description: Drizzle, REST, Express, Nest, client, and React entry points
sidebar_position: 3
---

# Adapters

Adapters are thin shells. They never open DB connections, read `.env`, or invent
API hosts — the **application injects** those.

| Adapter | App injects |
| --- | --- |
| Core | `store`, optional `credentials`, `accessSecret`, TTLs |
| Drizzle | existing Drizzle `db` + table schema(s) |
| REST / Express / Nest | constructed `jwtAuth` (+ transport options) |
| Client / React | `baseUrl` (string or getter), `storage`, optional `fetch` / `getHeaders` |

## Drizzle dialects

Table helpers for `pgsql` / `mysql` / `sqlite`:

- `createRefreshTokenTable` → default `jwt_auth_refresh_tokens`
- `createCredentialsTable` → default `jwt_auth_credentials` (**not** `users`)

Credentials columns: `id`, `subject` (app user id), `username`, `password_hash`,
`created_at`, `updated_at`, `disabled_at`.

```ts
// app code — you create the connection and own `users`
const db = drizzle(process.env.DATABASE_URL!);
const refreshTokens = createRefreshTokenTable("pgsql");
const credentialsTable = createCredentialsTable("pgsql");
const store = createDrizzleRefreshTokenStore({ dialect: "pgsql", db, table: refreshTokens });
const credentials = createDrizzleCredentialStore({
  dialect: "pgsql",
  db,
  table: credentialsTable,
});
```

## REST transport

`refreshTokenTransport`:

- `body` — read/write refresh token in JSON body
- `cookie` — HttpOnly cookie only
- `body-or-cookie` — accept either; set cookie on success (default)

## Framework shells

Express and Nest only map their request/response types onto `@eristack/jwt-auth/rest`.
Business rules stay in core.

Credential + session routes:

- `POST /login` → `login` (username/password → token pair)
- `POST /change-password` → `changePassword` (Bearer access token)
- `GET /sessions` → `listSessions` (Bearer)
- `DELETE /sessions/:sessionId` → `revokeSession` (ownership-checked family revoke)

`registerCredentials` stays in core (call from your signup/seed after inserting
into `users`). `POST /issue` remains for non-password flows.

Nest apps that need DB/config injection should use `JwtAuthModule.registerAsync({ inject, useFactory })`.

## Frontend

- `/client` — inject `baseUrl` / `storage` / `fetch` / `getHeaders`; use `client.login(...)`
- `/react` — pass `client` **or** `clientConfig` with those same injected fields; no UI widgets
