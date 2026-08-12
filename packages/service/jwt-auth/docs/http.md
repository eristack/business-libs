---
title: HTTP adapters
description: REST actions, the full route table, refresh-token transports, error mapping, Express and Nest
sidebar_position: 7
---

# HTTP adapters

The HTTP layer is deliberately thin. `@eristack/jwt-auth/rest` holds framework-free actions that take a plain request shape and return a plain response shape; Express and Nest only translate their own `req`/`res` types onto it. No business rule lives above core.

```text
core (createJwtAuth)
   │
   └── /rest              actions + createRequireAuth + cookie serializers
         ├── /express     createJwtAuthRouter + createExpressRequireAuth
         └── /nest        JwtAuthModule + JwtAuthController + JwtAuthGuard
```

## Route table

Paths below are shown as mounted in the examples: Express at `app.use("/auth", …)`, Nest's built-in controller at the fixed `auth` prefix.

| Method | Path | Action | Auth required | Body | Success |
| --- | --- | --- | --- | --- | --- |
| `POST` | `/auth/issue` | `issue` | **app-gated** (see below) | `{ subject, claims? }` | `201` + token pair |
| `POST` | `/auth/login` | `login` | none | `{ username, password, claims? }` | `200` + token pair |
| `POST` | `/auth/change-password` | `changePassword` | Bearer | `{ currentPassword, newPassword }` | `200` `{ ok: true }` |
| `POST` | `/auth/refresh` | `refresh` | refresh token | `{ refreshToken }` and/or cookie | `200` + token pair |
| `POST` | `/auth/logout` | `logout` | refresh token (optional) | `{ refreshToken }` and/or cookie | `200` `{ ok: true }` |
| `POST` | `/auth/logout-all` | `logoutAll` | Bearer | — | `200` `{ ok: true }` |
| `GET` | `/auth/sessions` | `listSessions` | Bearer | — (data-grid query string) | `200` `{ items, pageInfo, query }` |
| `DELETE` | `/auth/sessions/:sessionId` | `revokeSession` | Bearer | `{ sessionId }` optional | `200` `{ ok: true }` |

> **`POST /auth/issue` mints tokens for any `subject` with no authentication.** It exists for SSO callbacks and server-to-server issuance. In production either disable it (`paths` / `controller: false`, or don't mount the router) or put your own guard in front of it. See [Security](./security.md#gate-post-authissue).

Notes that matter in practice:

- `login` returns `200`; `issue` returns `201` because it creates a session for a subject you named.
- `change-password`, `logout-all`, `sessions`, and `revokeSession` derive `subject` from the **verified access token** — never from the body. A caller cannot act on another user.
- `logout` answers `200` even when no refresh token was supplied; logging out is idempotent.
- `revokeSession` reads `sessionId` from the body first, then from the path param, so both `DELETE /auth/sessions/:id` and a body-carrying variant work.
- `GET /auth/sessions` forwards the query string to `listSessions`, so [data-grid](/docs/data-grid) search params apply unchanged.

## Token pair response body

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9…",
  "refreshToken": "u3YqR1…",
  "accessTokenExpiresAt": "2026-08-12T08:05:11.000Z",
  "refreshTokenExpiresAt": "2026-09-11T07:50:11.000Z",
  "tokenType": "Bearer",
  "sessionId": "9f2c8b41…"
}
```

`refreshToken` is present only when the transport includes it in the body. Dates are ISO strings.

## Refresh-token transport

One option decides how refresh tokens travel in both directions:

```ts
createRestActions({ jwtAuth, refreshTokenTransport: "body-or-cookie" });
```

| Mode | Reads refresh from | Includes it in the body | Sets/clears the cookie | Use for |
| --- | --- | --- | --- | --- |
| `body` | body only | yes | no | Mobile, native, server-to-server |
| `cookie` | cookie only | **no** | yes | Browsers — token never touches JS |
| `body-or-cookie` *(default)* | body, falling back to cookie | yes | yes | Mixed clients, local development |

`cookie` is the strongest option for a browser SPA: with `HttpOnly` set, XSS cannot read the refresh token. `body-or-cookie` is convenient but means the token *is* readable by JavaScript, so it is a development-and-mixed-clients default rather than a security recommendation.

### Cookie options

```ts
createRestActions({
  jwtAuth,
  refreshTokenTransport: "cookie",
  refreshCookieName: "refresh_token",
  refreshCookie: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  },
});
```

| Setting | Default |
| --- | --- |
| `refreshCookieName` | `"refresh_token"` |
| `httpOnly` | `true` |
| `secure` | `true` |
| `sameSite` | `"lax"` |
| `path` | `"/"` |
| `Expires` | always `refreshTokenExpiresAt` — not configurable |

`logout` and `logout-all` emit a clearing `Set-Cookie` whenever the transport uses cookies.

> **Reading cookies requires a parser.** The adapters read `req.cookies`, which Express and Nest only populate if you install `cookie-parser` (`app.use(cookieParser())`). Without it, `cookie` mode silently finds no token and `refresh` answers `400 MISSING_REFRESH_TOKEN`.

Cross-site setups (`app.example.com` → `api.example.com`) need `sameSite: "none"` plus `secure: true`, CORS with `credentials: true`, an explicit origin (not `*`), and a client sending `credentials: "include"`.

## Error mapping

Core throws typed errors; `toErrorResponse` maps them. Every failure body is `{ error: { code, message } }` — one envelope to learn.

| Error | `code` | Status |
| --- | --- | --- |
| `RefreshTokenReuseError` | `REFRESH_TOKEN_REUSE` | `401` |
| `InvalidRefreshTokenError` | `INVALID_REFRESH_TOKEN` | `401` |
| `InvalidAccessTokenError` | `INVALID_ACCESS_TOKEN` | `401` |
| `InvalidCredentialsError` | `INVALID_CREDENTIALS` | `401` |
| `UsernameTakenError` | `USERNAME_TAKEN` | `409` |
| `SessionNotFoundError` | `SESSION_NOT_FOUND` | `404` |
| `CredentialNotFoundError` | `CREDENTIAL_NOT_FOUND` | `400` |
| `ConfigurationError` | `CONFIGURATION_ERROR` | `400` |
| any other `JwtAuthError` | its own `code` | `400` |
| anything else | `INTERNAL_ERROR` | `500` |

Validation inside the actions, before core is reached:

| Situation | `code` | Status |
| --- | --- | --- |
| `issue` without a string `subject` | `INVALID_BODY` | `400` |
| `login` without `username` / `password` | `INVALID_BODY` | `400` |
| `change-password` without both password fields | `INVALID_BODY` | `400` |
| `revokeSession` with no `sessionId` in body or path | `INVALID_BODY` | `400` |
| Missing/blank `Authorization: Bearer` on a protected action | `MISSING_ACCESS_TOKEN` | `401` |
| `refresh` with no token in body or cookie | `MISSING_REFRESH_TOKEN` | `400` |

```json
{ "error": { "code": "REFRESH_TOKEN_REUSE", "message": "Refresh token reuse detected; token family revoked" } }
```

> Clients should treat `401 REFRESH_TOKEN_REUSE` as terminal: the family is gone, so clear local tokens and show the login screen instead of retrying.

Note that a `400` on `/auth/change-password` may be either `INVALID_BODY` (missing fields) or `CONFIGURATION_ERROR` (new password shorter than 8 characters). Surface `error.message` to the user for the second case.

## REST (framework-free)

Use this layer directly for Fastify, Hono, Lambda, workers, or tests — anywhere you can adapt to two small interfaces.

```ts
import { createRestActions } from "@eristack/jwt-auth/rest";

const actions = createRestActions({ jwtAuth, refreshTokenTransport: "body" });

const response = await actions.login({
  method: "POST",
  headers: { get: (name) => incoming.headers[name.toLowerCase()] ?? null },
  cookies: { get: (name) => parsedCookies[name] },
  body: await readJson(incoming),
  params: {},
  query: {},
});

// response: { status, body, headers?, cookies?, clearCookies? }
```

The full set: `issue`, `login`, `changePassword`, `refresh`, `logout`, `logoutAll`, `listSessions`, `revokeSession`. Individual factories (`createLoginAction`, `createRefreshAction`, …) are exported too when you want to mount a subset.

Cookies come back as descriptors, not headers. Serialize them with the exported helpers:

```ts
import { serializeSetCookie, serializeClearCookie } from "@eristack/jwt-auth/rest";

for (const cookie of response.cookies ?? []) {
  outgoing.appendHeader("Set-Cookie", serializeSetCookie(cookie));
}
for (const name of response.clearCookies ?? []) {
  outgoing.appendHeader("Set-Cookie", serializeClearCookie(name));
}
```

## Express

```ts
import express from "express";
import cookieParser from "cookie-parser";
import { createJwtAuthRouter, createExpressRequireAuth } from "@eristack/jwt-auth/express";

const app = express();
app.use(express.json());
app.use(cookieParser());          // only needed for cookie transports

app.use(
  "/auth",
  createJwtAuthRouter({
    jwtAuth,
    refreshTokenTransport: "body",
  }),
);
```

`express.json()` is mandatory — every action reads `req.body`, and without the parser `login` sees an empty object and answers `400`.

Router paths are configurable when your product uses different URLs:

```ts
createJwtAuthRouter({
  jwtAuth,
  paths: {
    issue: "/issue",                       // POST
    login: "/sign-in",                     // POST
    changePassword: "/change-password",    // POST
    refresh: "/refresh",                   // POST
    logout: "/sign-out",                   // POST
    logoutAll: "/sign-out-all",            // POST
    sessions: "/devices",                  // GET
    revokeSession: "/devices/:sessionId",  // DELETE
  },
});
```

Omit `paths` and you get the defaults from the [route table](#route-table). Mount only what you need by not using the router at all and wiring individual actions instead — the usual reason is skipping `/issue`.

## Protecting your own routes

```ts
import { createExpressRequireAuth, type AuthedRequest } from "@eristack/jwt-auth/express";

const requireAuth = createExpressRequireAuth({ jwtAuth });

app.get("/me", requireAuth, (req: AuthedRequest, res) => {
  res.json({ subject: req.auth!.subject, claims: req.auth!.claims });
});
```

The middleware verifies `Authorization: Bearer …`, attaches `req.auth = { subject, claims, token }`, and short-circuits with `401` plus `{ error: { code, message } }` otherwise.

Framework-free equivalent:

```ts
import { createRequireAuth } from "@eristack/jwt-auth/rest";

const requireAuth = createRequireAuth({ jwtAuth });
const result = await requireAuth(restRequest);

if (!result.ok) {
  // result.status === 401
  // result.error.code === "MISSING_ACCESS_TOKEN" | "INVALID_ACCESS_TOKEN"
  return;
}
result.auth.subject;
```

Authorization is yours: this layer tells you *who* is calling, never *what* they may do. Read `req.auth.claims` (or load permissions by `subject`) in your own guard.

## NestJS

`JwtAuthModule.register` when the app already built `jwtAuth`:

```ts
import { JwtAuthModule } from "@eristack/jwt-auth/nest";

@Module({
  imports: [JwtAuthModule.register({ jwtAuth, refreshTokenTransport: "body" })],
})
export class AppModule {}
```

`registerAsync` when it depends on injected providers — the usual case, because the store needs your database:

```ts
@Module({
  imports: [
    DatabaseModule,
    JwtAuthModule.registerAsync({
      imports: [DatabaseModule],
      inject: [APP_DATABASE],
      useFactory: (appDb: AppDatabase) => ({
        jwtAuth: createJwtAuth({
          accessSecret: appConfig.jwtAccessSecret,
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

The module registers `JwtAuthController` (fixed `auth` prefix, same eight routes), provides `JwtAuthGuard`, and exports two tokens:

| Export | What it is |
| --- | --- |
| `JWT_AUTH` | the `JwtAuth` instance, for your own services |
| `JWT_AUTH_REST_CONFIG` | the `RestAuthConfig`, if you build extra actions |
| `JwtAuthGuard` | `CanActivate` that verifies Bearer tokens and sets `req.auth` |

Pass `controller: false` to skip the built-in routes and expose your own — useful when you need custom paths, extra validation, or a gate on `/auth/issue`.

```ts
import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { JWT_AUTH, JwtAuthGuard } from "@eristack/jwt-auth/nest";
import type { JwtAuth } from "@eristack/jwt-auth";

@Controller("me")
export class MeController {
  constructor(@Inject(JWT_AUTH) private readonly jwtAuth: JwtAuth) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  me(@Req() req: { auth: { subject: string; claims: Record<string, unknown> } }) {
    return { subject: req.auth.subject, claims: req.auth.claims };
  }
}
```

The guard throws `UnauthorizedException` with the same `{ code, message }` payload the Express middleware returns.

## Trying it with curl

```bash
# Log in
curl -s http://localhost:3001/auth/login \
  -H 'content-type: application/json' \
  -d '{"username":"demo","password":"password123"}'

# Use the access token
curl -s http://localhost:3001/me -H "Authorization: Bearer $ACCESS"

# Rotate
curl -s http://localhost:3001/auth/refresh \
  -H 'content-type: application/json' \
  -d "{\"refreshToken\":\"$REFRESH\"}"

# Devices
curl -sG http://localhost:3001/auth/sessions \
  -H "Authorization: Bearer $ACCESS" \
  --data-urlencode 'page=1' --data-urlencode 'pageSize=10'

# Revoke one
curl -s -X DELETE "http://localhost:3001/auth/sessions/$SESSION_ID" \
  -H "Authorization: Bearer $ACCESS"
```

`examples/express` boots exactly this surface on SQLite with a seeded `demo` / `password123` user; `examples/nestjs` shows the same via `registerAsync`.

## Next steps

- [Client & React](./client-and-react.md) — the frontend half of these routes
- [Database](./database.md) — production stores behind the routes
- [Security](./security.md) — gating `/issue`, cookies, rate limits
- [Recipes](./recipes.md) — end-to-end wiring
