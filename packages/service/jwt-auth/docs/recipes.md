---
title: Recipes
description: End-to-end patterns for signup, SSO, SPAs, sessions UI, and framework wiring
sidebar_position: 10
---

# Recipes

Copy these patterns instead of inventing new shapes. Runnable references: `examples/express` and `examples/react`.

## Password signup

1. Insert your `users` row (app-owned).
2. `registerCredentials({ subject: user.id, username, password })`.
3. `login` → return tokens to the client.
4. Never create a second “users” model inside jwt-auth.

```ts
await db.insert(users).values({ id, displayName, createdAt: new Date() });
await auth.registerCredentials({ subject: id, username, password });
const tokens = await auth.login({ username, password });
```

## SSO / magic link / already-verified subject

Skip credentials. After your IdP (or email link) proves identity:

```ts
const tokens = await auth.issueTokens({
  subject: user.id,
  claims: { role: user.role, provider: "oidc" },
});
```

> **Gate `POST /issue`.** Anyone who can hit an unauthenticated issue endpoint can mint sessions for any subject. See [Security](./security.md).

## SPA with body refresh

Default Express demo: refresh token in JSON body; client stores tokens (memory or `localStorage` via injected storage).

1. Mount `createJwtAuthRouter({ jwtAuth, refreshTokenTransport: "body" })`.
2. `createJwtAuthClient({ baseUrl, storage })` in the browser.
3. Wrap with `JwtAuthProvider` + `QueryClientProvider`.
4. Use `useLogin` / `useAuthSessions` / `useLogout`.

## SPA with HttpOnly cookie refresh

Prefer cookies when XSS is a primary concern:

```ts
createJwtAuthRouter({
  jwtAuth,
  refreshTokenTransport: "cookie", // or "body-or-cookie"
});
```

Access token still goes in memory / Authorization header. Refresh rides the cookie. Align CSRF strategy with your SameSite settings ([Security](./security.md)).

## “Your devices” session UI

```ts
const page = await auth.listSessions(subject, {
  mode: "advanced",
  sorts: [{ field: "createdAt", dir: "desc" }],
  page: { mode: "offset", page: 1, pageSize: 20 },
});
// page.items / page.pageInfo / page.query

await auth.revokeSession({ sessionId: page.items[0]!.id, subject });
```

React: `useAuthSessions()` returns a TanStack Query result whose data is a `DataGridResult`. Revoke with `useRevokeSession`. Schema: [Sessions](./sessions.md).

## Change password and kill other sessions

`changePassword` does **not** revoke refresh tips. If that is the product rule:

```ts
await auth.changePassword({ subject, currentPassword, newPassword });
await auth.revokeAllForSubject(subject);
// then issue fresh tokens for the current device
```

## Nest + Drizzle (`registerAsync`)

```ts
JwtAuthModule.registerAsync({
  imports: [DatabaseModule],
  inject: [DB],
  useFactory: (db) => ({
    jwtAuth: createJwtAuth({
      accessSecret: config.jwtAccessSecret,
      store: createDrizzleRefreshTokenStore({ dialect: "sqlite", db, table }),
      credentials: createDrizzleCredentialStore({ dialect: "sqlite", db, table }),
    }),
  }),
});
```

Use `controller: false` when you only want the guard / injected `JWT_AUTH` token.

## Express + React (monorepo examples)

```bash
pnpm --filter @eristack/example-express dev   # :3001
pnpm --filter @eristack/example-react dev     # :5173 proxies /auth
```

Login as `demo` / `password123`. Sessions list and logout-all are wired through `/react` hooks against the Express router.
