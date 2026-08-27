---
title: Dual-target auth client
description: Same login client against Backseat (Horizon A) or Express (Horizon B)
sidebar_position: 10
---

# Dual-target auth client

Horizon A mounts jwt-auth on **Backseat** at `/api/auth/*`. Horizon B mounts the **same paths** on Express. The React app keeps one `createJwtAuthClient` — only `baseUrl` changes.

## One client module

```ts
import {
  createJwtAuthClient,
  createLocalStorageTokenStorage,
} from "@eristack/jwt-auth/client";

const apiBase =
  import.meta.env.VITE_API_BASE ?? "/api"; // Backseat: "/api" · Express: "http://localhost:3001"

export const authClient = createJwtAuthClient({
  baseUrl: () => apiBase,
  storage: createLocalStorageTokenStorage("my-app"),
  credentials: "same-origin", // use "include" only when cookies carry refresh
});
```

Wrap with `JwtAuthProvider` from `@eristack/jwt-auth/react`. The UI must not branch on “mock vs real” — only the base URL and fetch target change.

## Route parity (default mounts)

Both adapters use **`createRestActions`** — same handlers, same status codes.

| Method | Path (after mount) | Backseat register | Express mount |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | `registerJwtAuthBackseat(api, { basePath: "/auth" })` | `app.use("/auth", createJwtAuthRouter(...))` |
| `POST` | `/auth/refresh` | same | same |
| `POST` | `/auth/logout` | same | same |
| `POST` | `/auth/logout-all` | same | same |
| `POST` | `/auth/change-password` | same | same |
| `POST` | `/auth/issue` | same | same |
| `GET` | `/auth/sessions` | same | same |
| `DELETE` | `/auth/sessions/:sessionId` | same | same |

Backseat resolves paths relative to `api.baseUrl` (default `/api`). Express mounts the router at `/auth` on your server root.

### Client path defaults

`createJwtAuthClient` defaults match the table (`loginPath: "/auth/login"`, …). Override only if you changed adapter `paths`.

## Backseat wiring (Horizon A)

```ts
import { createBackseat } from "@eristack/backseat";
import { createIndexedDbBackseatStore } from "@eristack/backseat/store";
import { registerJwtAuthBackseat } from "@eristack/jwt-auth/backseat";

const api = createBackseat({
  store: createIndexedDbBackseatStore({ dbName: "my-app" }),
  baseUrl: "/api",
});

registerJwtAuthBackseat(api, {
  accessSecret: process.env.JWT_ACCESS_SECRET!,
  store: jwtStores.refreshTokens,
  credentials: jwtStores.credentials,
  refreshTokenTransport: "body", // match Express option
});

// In Vite: api.fetch shim or BackseatProvider handle → same-origin /api/*
```

## Express wiring (Horizon B)

```ts
import { createJwtAuthRouter } from "@eristack/jwt-auth/express";

app.use(
  "/auth",
  createJwtAuthRouter({
    jwtAuth: auth,
    refreshTokenTransport: "body", // keep identical to Backseat
  }),
);
```

## Flip checklist (derive-backend sprint)

1. **`refreshTokenTransport`** — same on Backseat + Express (`"body"` is typical for SPA).
2. **`baseUrl`** — `/api` (proxy to Backseat) → `http://localhost:3001` (or production host).
3. **CORS** — Express needs `credentials` + allowed origin when base URL is cross-origin.
4. **Paths** — if you customized `paths` on one adapter, mirror on the other.
5. **Core in browser** — `@eristack/jwt-auth` core uses `@noble/hashes` scrypt (browser-safe since 0.3.1). Do not import `createJwtAuth` in client components for password UI — use `/client` + Backseat/REST adapters for login.

## React provider

```tsx
<JwtAuthProvider client={authClient}>
  <App />
</JwtAuthProvider>
```

TanStack Query data hooks should call `await client.ensureAccessToken()` (or use app helpers that do). No second auth client for Horizon B.

## Related

- [Client & React](./client-and-react.md) — full client API
- [Backseat adapter](./backseat.md) — store factories
- [HTTP adapters](./http.md) — REST semantics
- `@eristack/ai-knowledge#backseat-then-backend` — Horizon A/B overview
