---
title: Concepts
description: Users, credentials, refresh families, sessions, and the injection rule
sidebar_position: 3
---

# Concepts

Four ideas explain nearly every design decision in this package. Get them straight and the API becomes predictable; get them muddled and you will fight the library.

1. Users, credentials, and refresh families are **three different things**.
2. Access tokens are **stateless**; refresh tokens are **stateful**.
3. A session is the **current tip** of a refresh family.
4. The library **never** creates infrastructure — you inject it.

## Users vs credentials vs refresh families

```text
users                       ← YOUR table. Name, email, tenant, roles, everything.
  id: "user_1"
     │
     │ subject
     ▼
jwt_auth_credentials        ← optional child. One row per user, at most.
  subject: "user_1"
  username: "ada"
  password_hash: "scrypt$…"
     │
     │ subject
     ▼
jwt_auth_refresh_tokens     ← many rows per user, grouped into families.
  family "fam_A" (laptop):  tok1 → tok2 → tok3   ← tip = current session
  family "fam_B" (phone):   tok9                 ← tip = current session
```

| Entity | Owned by | Cardinality | Purpose |
| --- | --- | --- | --- |
| User | **Your app** | 1 | Identity, profile, tenancy, authorization data |
| Credential | jwt-auth (optional) | 0..1 per user | *One* way to prove you are that user |
| Refresh family | jwt-auth | 0..n per user | One long-lived login on one device |
| Refresh token | jwt-auth | 1..n per family | One rotation step; only the tip is usable |

### `subject` is your user id

Everywhere you see `subject` — in `issueTokens`, `registerCredentials`, `revokeSession`, the `sub` claim, the `subject` column — it means **the primary key of your users table**. The package stores it as an opaque string and never interprets it.

> **The most common mistake** is treating this package as an auth service that owns users. It does not. There is no `createUser`, no email field, no profile. `registerCredentials` *attaches* a login to a user that already exists.

Concretely, in your Drizzle schema:

```ts
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

// Child of `users` via `subject` — never name this table `users`.
export const jwtAuthCredentials = createCredentialsTable("sqlite");
export const jwtAuthRefreshTokens = createRefreshTokenTable("sqlite");
```

This separation is what lets a user have **no** password at all. SSO-only users, service accounts, and impersonated sessions get tokens through `issueTokens` and simply have no credential row. Password login is a feature you opt into by passing a `credentials` store.

## Access JWT vs opaque refresh

Two tokens because they answer two different questions.

| | Access token | Refresh token |
| --- | --- | --- |
| Question | "Who is calling this request?" | "May I still be logged in?" |
| Format | HS256 JWT with `sub`, `iat`, `exp`, `jti` (+ your claims) | 32 random bytes, base64url — no structure, no meaning |
| Validation | Verify signature, `exp`, and (if configured) `iss` / `aud` | Hash it, look the hash up, check `expiresAt` and `revokedAt` |
| Server state | **None** | One row per rotation step |
| Stored server-side | Never | **SHA-256 hash only** — the plaintext exists only in the response |
| Can be revoked? | No. It stays valid until `exp`. | Yes — individually, by family, or by user |
| Frequency of use | Every API request | Once per access-token lifetime |

Two consequences follow directly:

- **Keep the access TTL short.** Revoking a session cannot invalidate an access token that is already out there; you are waiting out its `exp`. Fifteen minutes is the default for that reason.
- **Treat the refresh token like a password.** It is a bearer secret with a 30-day life. Store it in an `HttpOnly` cookie or platform secure storage, never in a place that survives longer than it needs to.

Because only a hash is persisted, a leaked database dump does not yield usable refresh tokens — and no code path in this package can print a refresh token that it read from storage.

## Rotation and the family

A **family** (`familyId`) is one continuous login on one device. Each refresh replaces the tip:

```text
login          →  tok1  (tip, family fam_A)
refresh(tok1)  →  tok2  (tip)      tok1 marked replaced + revoked
refresh(tok2)  →  tok3  (tip)      tok2 marked replaced + revoked
refresh(tok1)  →  REUSE DETECTED — every token in fam_A revoked
```

The last line is the whole point of rotation. A replayed old token means two parties hold the same secret, so the library assumes theft and kills the family rather than guessing which holder is legitimate. That surfaces as `RefreshTokenReuseError`. Full walkthrough in [Tokens & refresh](./tokens-and-refresh.md#reuse-detection).

Family also defines the unit of "log out this device": `revokeSession` revokes the entire family, not just the tip, so an attacker holding an older token in the chain gains nothing.

## A session is the tip of a family

There is no separate sessions table. An **active session** is simply a refresh-token row that is not revoked and not expired — in practice, the tip of a live family.

```ts
interface AuthSession {
  id: string;        // refresh record id — this is `sessionId` on TokenPair
  familyId: string;  // the device/login this belongs to
  createdAt: Date;   // when this tip was minted (i.e. last refresh)
  expiresAt: Date;
}
```

That shape is deliberately boring: no plaintext, no hash, no claims, no IP, no user agent. It is safe to render straight into a UI.

Note what `createdAt` means: because refreshing mints a new row, the tip's `createdAt` is the **last refresh time**, not the original login time. It reads naturally as "last seen" in a device list.

Two implications worth internalizing:

- `TokenPair.sessionId` is the id of the row that was just written, so a client can mark one entry in the list as "this device".
- After a refresh, the previous `sessionId` no longer exists in the list. Clients that cache it must update it from every token pair they receive.

See [Sessions](./sessions.md) for the query surface.

## Errors are the API

Core throws typed errors, and every one carries a stable `code`. Adapters map them to HTTP status codes without inventing new shapes.

| Error | `code` | Thrown when |
| --- | --- | --- |
| `InvalidAccessTokenError` | `INVALID_ACCESS_TOKEN` | Bad signature, expired, wrong `iss`/`aud`, missing `sub` |
| `InvalidRefreshTokenError` | `INVALID_REFRESH_TOKEN` | Unknown hash, empty token, or expired refresh token |
| `RefreshTokenReuseError` | `REFRESH_TOKEN_REUSE` | A revoked/replaced token was presented — family revoked |
| `InvalidCredentialsError` | `INVALID_CREDENTIALS` | Wrong username or password, or disabled credential |
| `UsernameTakenError` | `USERNAME_TAKEN` | `registerCredentials` on an existing username |
| `CredentialNotFoundError` | `CREDENTIAL_NOT_FOUND` | `changePassword` for a subject with no live credential |
| `SessionNotFoundError` | `SESSION_NOT_FOUND` | `revokeSession` for an unknown session or one owned by someone else |
| `ConfigurationError` | `CONFIGURATION_ERROR` | Missing secret/store, short password, missing required input |

All extend `JwtAuthError`, so `error instanceof JwtAuthError` catches package errors and lets genuine bugs escape to your error handler. The HTTP mapping is in [HTTP adapters](./http.md#error-mapping).

## Stores are ports

Core depends on two interfaces, nothing more. Anything satisfying them works — Drizzle, Prisma, Redis, a test double.

```ts
interface RefreshTokenStore {
  save(record): Promise<void>;
  findByHash(tokenHash): Promise<RefreshTokenRecord | null>;
  findById(id): Promise<RefreshTokenRecord | null>;
  listActiveBySubject(subject, now): Promise<RefreshTokenRecord[]>;
  revoke(id, revokedAt): Promise<void>;
  revokeFamily(familyId, revokedAt): Promise<void>;
  revokeAllForSubject(subject, revokedAt): Promise<void>;
  markReplaced(id, replacedByTokenId, revokedAt): Promise<void>;
}

interface CredentialStore {
  save(record): Promise<void>;
  findByUsername(username): Promise<CredentialRecord | null>;
  findBySubject(subject): Promise<CredentialRecord | null>;
  updatePasswordHash(id, passwordHash, updatedAt): Promise<void>;
  disable(id, disabledAt): Promise<void>;
}
```

Two things stand out. `listActiveBySubject` receives `now` from the injected clock rather than calling `Date.now()` itself, which keeps time-travel tests honest. And `disable` exists on the port but no core method calls it — disabling a login is an administrative action you trigger directly on the store ([Credentials](./credentials.md#disabling-a-login)).

## The injection rule

> **Adapters accept instances and getters. They never construct infrastructure.**

The package opens no sockets, reads no `process.env`, guesses no API host, and mounts no `QueryClientProvider`. Every layer states exactly what the app must hand it:

| Layer | You inject |
| --- | --- |
| Core | `accessSecret`, `store`, optional `credentials`, TTLs, `issuer`, `audience`, `clock` |
| Drizzle | your `db` handle, the table object, the `dialect` |
| REST / Express / Nest | the constructed `jwtAuth` (+ transport and cookie options) |
| Client | `baseUrl` (string **or** getter), `storage`, optional `fetch` / `getHeaders` / `credentials` |
| React | a `client` **or** a `clientConfig`; plus your own `QueryClientProvider` |

Getters exist so multi-tenant and runtime-configured apps work without re-creating clients: `baseUrl: () => appConfig.apiBaseUrl` is resolved per request, as is `getHeaders` for tenant ids or CSRF tokens.

The payoff is testability and honesty. Swap Drizzle for memory stores in unit tests, freeze the clock, point the client at a mock `fetch` — no globals, no hidden singletons, no surprise network calls.

## Next steps

- [Credentials](./credentials.md) — the password half of the story
- [Tokens & refresh](./tokens-and-refresh.md) — the token half
- [Sessions](./sessions.md) — device lists via data-grid
- [Database](./database.md) — the two tables and your foreign key
