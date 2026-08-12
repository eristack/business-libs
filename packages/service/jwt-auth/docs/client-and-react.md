---
title: Client & React
description: A headless token state machine for browsers, plus TanStack Query and Form bindings
sidebar_position: 9
---

# Client & React

The frontend layers mirror the backend ones: `/client` is a framework-agnostic HTTP and token state machine, and `/react` is a thin binding over it. Neither ships UI, and `/react` never calls `fetch` itself.

```text
@eristack/jwt-auth/client        baseUrl + storage + fetch → token state machine
        │
        └── /react               provider, hooks, TanStack Query + Form helpers
```

Vue, Svelte, Solid, or plain TypeScript can wrap `/client` the same way `/react` does.

## The client

```ts
import {
  createJwtAuthClient,
  createLocalStorageTokenStorage,
} from "@eristack/jwt-auth/client";

const client = createJwtAuthClient({
  baseUrl: () => appConfig.apiBaseUrl,   // string or getter
  storage: createLocalStorageTokenStorage("acme"),
  credentials: "same-origin",
  getHeaders: () => ({ "X-Tenant": tenantId }),
});
```

`storage` is required — omitting it throws immediately, because the package will not pick a persistence strategy for you. Everything else has a default.

| Option | Default | Notes |
| --- | --- | --- |
| `baseUrl` | *required* | `string` or `() => string \| Promise<string>`, resolved per request |
| `storage` | *required* | `TokenStorage`; sync or async |
| `refreshSkewMs` | `60_000` | Refresh this long before `exp` |
| `fetch` | global `fetch` | Inject for SSR, tests, or instrumentation |
| `credentials` | `"include"` | Static value or getter; use `"same-origin"` behind a proxy |
| `getHeaders` | — | Merged into every request (tenant id, CSRF, tracing) |
| `issuePath` | `/auth/issue` | |
| `loginPath` | `/auth/login` | |
| `changePasswordPath` | `/auth/change-password` | |
| `refreshPath` | `/auth/refresh` | |
| `logoutPath` | `/auth/logout` | |
| `logoutAllPath` | `/auth/logout-all` | |
| `sessionsPath` | `/auth/sessions` | Used for both `GET` and `DELETE /:id` |

> Defaults assume the routes are mounted under `/auth`, which is what `createJwtAuthRouter` at `app.use("/auth", …)` and the Nest controller both give you. Override the paths if your API differs — the client will not guess.

### Methods

| Method | Does |
| --- | --- |
| `login({ username, password, claims? })` | `POST` login, persist the pair, go `authenticated` |
| `issue({ subject, claims? })` | `POST` issue, persist the pair (for gated/admin flows) |
| `acceptTokenPair(pair)` | Persist a pair your app obtained itself (SSO callback) |
| `refresh()` | Rotate; de-duplicates concurrent calls |
| `ensureAccessToken()` | Return a valid token, refreshing first if it is near expiry |
| `getAccessToken()` | Read the stored token without refreshing |
| `changePassword({ currentPassword, newPassword })` | Authenticated `POST` |
| `logout()` | `POST` logout, then clear storage — clears even if the request fails |
| `logoutAll()` | `POST` logout-all, then clear storage |
| `listSessions(query?)` | `GET` sessions, returns a `DataGridResult` |
| `revokeSession(sessionId)` | `DELETE` one session |
| `getState()` / `subscribe(fn)` | Read or observe `{ status, accessToken, accessTokenExpiresAt }` |
| `dispose()` | Cancel the refresh timer and drop listeners |

`status` is `"unknown"` until the client has read storage, then `"authenticated"` or `"anonymous"`. Render loading states off `"unknown"` rather than assuming anonymous.

### `ensureAccessToken`

This is the method your data layer should call. It is the only one that guarantees a usable token:

```ts
const token = await client.ensureAccessToken();
if (!token) return redirectToLogin();

await fetch("/orders", { headers: { Authorization: `Bearer ${token}` } });
```

Its logic:

1. No stored token → set `anonymous`, return `null`
2. Token present and more than `refreshSkewMs` from expiry → return it
3. Otherwise `refresh()`; on success return the new token
4. If refresh fails → clear storage, go `anonymous`, return `null`

Because step 4 swallows the failure and returns `null`, callers get one clean signal — no token means show the login screen. Prefer this over `getAccessToken()`, which returns whatever is stored even if it expired a minute ago.

This composes cleanly with other packages' clients:

```ts
const orders = createDataGridClient({
  baseUrl: () => appConfig.apiBaseUrl,
  path: "/orders",
  schema: orderGridSchema,
  getHeaders: async () => {
    const token = await client.ensureAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

### Automatic refresh

After every persisted pair, the client schedules a timer for `expiresAt - refreshSkewMs` and refreshes in the background, so an idle tab stays signed in. Proactive failures are swallowed — state stays as-is until the next explicit call decides what to do.

Concurrent refreshes are de-duplicated: a second `refresh()` while one is in flight awaits the same promise. That matters because rotation kills the old token, so two parallel refreshes with the same token would trip [reuse detection](./tokens-and-refresh.md#reuse-detection).

Call `dispose()` when tearing the client down (hot reload, logout of an entire micro-frontend) to clear the timer.

### Storage

```ts
interface TokenStorage {
  getAccessToken(): string | null | Promise<string | null>;
  setAccessToken(token: string | null): void | Promise<void>;
  getRefreshToken(): string | null | Promise<string | null>;
  setRefreshToken(token: string | null): void | Promise<void>;
  getAccessTokenExpiresAt(): string | null | Promise<string | null>;
  setAccessTokenExpiresAt(iso: string | null): void | Promise<void>;
}
```

Two implementations ship:

| Factory | Persistence | Use for |
| --- | --- | --- |
| `createMemoryTokenStorage()` | none — lost on reload | Tests, SSR, short-lived tabs |
| `createLocalStorageTokenStorage(prefix?)` | `localStorage`, default prefix `eristack.jwt-auth` | Browser apps with body-transport refresh |

Async signatures exist so React Native `SecureStore`, IndexedDB, or an encrypted wrapper drop in without changes.

> **`localStorage` is readable by any script on your origin.** With `refreshTokenTransport: "cookie"` on the server, the refresh token never reaches JavaScript at all: the cookie travels automatically, `setRefreshToken` stores `null`, and only the short-lived access token lives in storage. That is the safer browser setup — see [Security](./security.md#browser-storage-and-xss).

## React

### Provider

```tsx
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { JwtAuthProvider } from "@eristack/jwt-auth/react";

const queryClient = new QueryClient();

createRoot(root).render(
  <QueryClientProvider client={queryClient}>
    <JwtAuthProvider client={client}>
      <App />
    </JwtAuthProvider>
  </QueryClientProvider>,
);
```

> **`QueryClientProvider` is required and is yours.** `useAuthSessions` and every mutation hook call TanStack Query; without a provider above them React throws. The package deliberately does not mount one so it cannot fight your app's cache configuration.

Pass either a ready `client` or a `clientConfig`:

```tsx
<JwtAuthProvider clientConfig={{ baseUrl, storage: createLocalStorageTokenStorage() }}>
```

With `clientConfig` the provider creates the client and disposes it on unmount. With `client` you own the lifecycle — which is what you want when non-React code (a Router loader, an interceptor) also needs `ensureAccessToken`. Keep the config object stable (module scope or `useMemo`) so the client is not recreated on every render.

Only `JwtAuthProvider` needs the auth context; hooks used outside it throw a clear error.

### Auth state hooks

```tsx
import { useJwtAuth, useAuthStatus, useAccessToken } from "@eristack/jwt-auth/react";

function Header() {
  const { status, logout, logoutAll, ensureAccessToken } = useJwtAuth();

  if (status === "unknown") return <Spinner />;
  if (status === "anonymous") return <SignInLink />;
  return <button onClick={() => void logout()}>Sign out</button>;
}
```

`useJwtAuth` returns the client plus its state and pre-bound methods (`login`, `issue`, `refresh`, `logout`, `logoutAll`, `changePassword`, `listSessions`, `revokeSession`, `acceptTokenPair`, `ensureAccessToken`). `useAuthStatus` and `useAccessToken` are narrow selectors for components that only need one value.

Auth status flows through the client's `subscribe` model, **not** the Query cache. That keeps "am I signed in?" synchronous and independent of fetch lifecycles.

### Sessions with TanStack Query

```tsx
import {
  useAuthSessions,
  useRevokeSession,
  authSessionsQueryKey,
} from "@eristack/jwt-auth/react";

function Devices() {
  const sessions = useAuthSessions({ pageSize: 10 });
  const revoke = useRevokeSession();

  return (
    <ul>
      {sessions.data?.items.map((session) => (
        <li key={session.id}>
          {new Date(session.createdAt).toLocaleString()}
          <button onClick={() => revoke.mutate(session.id)}>Revoke</button>
        </li>
      ))}
    </ul>
  );
}
```

`useAuthSessions` stays disabled until `status === "authenticated"`, so it never fires an unauthenticated request during startup. Its key is `["eristack", "jwt-auth", "sessions", <serialized query>]`; `authSessionsQueryKey(queryInput)` builds the same key for prefetching or manual invalidation.

### Mutations

| Hook | Wraps | Cache effect |
| --- | --- | --- |
| `useLogin()` | `client.login` | invalidates sessions on success |
| `useLogout()` | `client.logout` | invalidates sessions when settled |
| `useLogoutAll()` | `client.logoutAll` | invalidates sessions when settled |
| `useRevokeSession()` | `client.revokeSession` | invalidates sessions on success |
| `useChangePassword()` | `client.changePassword` | none |

All are standard `useMutation` results — `mutate`, `mutateAsync`, `isPending`, `error`. Invalidation targets the `["eristack","jwt-auth","sessions"]` prefix, so any page size or filter refetches.

### Forms

The Form helpers are option builders, not components: default values and a typed `onSubmit`, nothing more.

```tsx
import { useForm } from "@tanstack/react-form";
import { createLoginFormOptions, useLogin } from "@eristack/jwt-auth/react";

function LoginForm() {
  const login = useLogin();

  const form = useForm({
    ...createLoginFormOptions({
      onSubmit: async (value) => {
        await login.mutateAsync(value);
      },
    }),
  });

  return (
    <form onSubmit={(event) => { event.preventDefault(); void form.handleSubmit(); }}>
      <form.Field name="username">
        {(field) => (
          <input
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
          />
        )}
      </form.Field>
      <form.Field name="password">
        {(field) => (
          <input
            type="password"
            value={field.state.value}
            onChange={(event) => field.handleChange(event.target.value)}
          />
        )}
      </form.Field>
      <button type="submit" disabled={login.isPending}>Sign in</button>
      {login.error ? <p role="alert">{login.error.message}</p> : null}
    </form>
  );
}
```

`createChangePasswordFormOptions` is the same shape for `{ currentPassword, newPassword }`. Add your own validators and layout — the package ships no inputs, labels, or styles, on purpose.

## Errors on the client

The client throws plain `Error`s whose message comes from the server's `error.message` when present, falling back to `Request failed with <status>`. Typed error classes are a server-side concern; check the message or wrap the call if you need to branch:

```ts
try {
  await client.refresh();
} catch (error) {
  // e.g. "Refresh token reuse detected; token family revoked"
  await client.logout();   // clears storage even though the request may fail
  redirectToLogin();
}
```

`login` failures surface the deliberately vague `Invalid username or password` — show it verbatim rather than guessing which field was wrong.

## SSR notes

The client reads storage in a fire-and-forget initializer, so it is browser-shaped by nature. On the server, use `createMemoryTokenStorage()` and an injected `fetch` per request, and never share one client across requests — that would leak one user's tokens into another's render. In most SSR setups it is simpler to keep auth entirely client-side and forward cookies for server-rendered data fetches.

## Runnable example

`examples/react` puts all of this together against `examples/express`: `createJwtAuthClient` with `localStorage`, `JwtAuthProvider`, a login form, a "signed in" panel showing the current `sessionId`, a session list with per-device revoke, and a data-grid orders panel that authenticates through `ensureAccessToken`.

```bash
pnpm --filter @eristack/example-express dev
pnpm --filter @eristack/example-react dev
```

## Next steps

- [Sessions](./sessions.md) — the query surface behind `useAuthSessions`
- [HTTP adapters](./http.md) — the routes these paths point at
- [Recipes](./recipes.md) — SPA and session-UI patterns end to end
- [Security](./security.md) — storage, XSS, cookie transport
