---
title: Sessions
description: List active devices with data-grid, mark the current one, and revoke by session id
sidebar_position: 6
---

# Sessions

"Where am I logged in?" and "log that laptop out" are product features, and this package gives you both without a sessions table. An active session **is** a live refresh token — no extra state, no synchronization problem.

## What a session is

A session is a refresh-token row that is neither revoked nor expired. Because rotation replaces the tip, the rows you see in a list are the current tips of each family.

```ts
interface AuthSession {
  id: string;        // refresh record id — matches `TokenPair.sessionId`
  familyId: string;  // the device / login this belongs to
  createdAt: Date;   // when this tip was minted → effectively "last active"
  expiresAt: Date;
}
```

That is the entire shape. No token, no hash, no claims, no IP address, no user agent — it is safe to send straight to a browser.

> **`createdAt` is the last refresh, not the original login.** Each refresh writes a new row, so a session that refreshes every 15 minutes shows a `createdAt` minutes old. Label it "last active" in your UI, not "signed in at". If you need the true login time, that is the `createdAt` of the family's first record — not exposed by `listSessions`, so track it yourself if the product demands it.

The package intentionally captures no device metadata. Recording IP or user agent requires a request context that core does not have — and storing it has privacy implications you should opt into consciously. If you want it, add columns to your own copy of the table and join on `familyId` in your handler.

## Listing sessions

```ts
const result = await auth.listSessions(userId);

result.items;      // AuthSession[]
result.pageInfo;   // { mode: "offset", page, pageSize, total, totalPages, hasNext, hasPrev }
result.query;      // the normalized query the server actually applied
```

`listSessions` returns a [`DataGridResult`](/docs/data-grid) — the same envelope as every other list in the Eristack stack, so your frontend reuses one pattern for orders, invoices, and devices alike. Passing no query is fine; schema defaults fill in.

Internally it loads the subject's active rows via `store.listActiveBySubject(subject, now)`, maps them to `AuthSession`, and runs `createDataGrid(sessionDataGridSchema).applyInMemory(sessions, query)`. Filtering and sorting happen **in memory**, which is the right call: one user has a handful of devices, not a table worth scanning.

An empty `subject` throws `ConfigurationError`.

## The session schema

`sessionDataGridSchema` is exported so clients, tests, and your own endpoints validate against exactly what the server accepts:

```ts
import { sessionDataGridSchema } from "@eristack/jwt-auth";
```

| Field | Type | Filterable | Sortable | Searchable |
| --- | --- | --- | --- | --- |
| `id` | `string` | yes | yes | yes |
| `familyId` | `string` | yes | yes | yes |
| `createdAt` | `date` | yes | yes | no |
| `expiresAt` | `date` | yes | yes | no |

| Schema setting | Value |
| --- | --- |
| `defaultSorts` | `[{ field: "createdAt", dir: "desc" }]` |
| `defaultPageSize` | `20` |
| `maxPageSize` | `100` |
| `defaultMode` | `"advanced"` |
| `defaultPageMode` | `"offset"` |

Newest-first by default, which is what a device list wants.

### Querying

Anything the data-grid parser accepts works: a query string, `URLSearchParams`, a Router search object, or a partial query object.

```ts
// Newest 5
await auth.listSessions(userId, { page: 1, pageSize: 5 });

// Oldest first
await auth.listSessions(userId, { sorts: [{ field: "createdAt", dir: "asc" }] });

// Everything in one family (one device's chain of tips)
await auth.listSessions(userId, {
  mode: "advanced",
  filters: { type: "clause", field: "familyId", op: "eq", value: familyId },
});

// Expiring within the next day
await auth.listSessions(userId, {
  mode: "advanced",
  filters: {
    type: "clause",
    field: "expiresAt",
    op: "lte",
    value: new Date(Date.now() + 86_400_000).toISOString(),
  },
});
```

Unknown fields or operators are rejected at parse time with data-grid's `InvalidQueryError` / `InvalidOperatorError`, which HTTP adapters turn into `400`. Requesting `pageSize=500` is clamped to `maxPageSize`.

> Sessions are always scoped to the `subject` you pass — the schema has no `subject` field, so a client cannot widen the query to another user's devices. `GET /auth/sessions` derives the subject from the verified access token, never from input.

## Marking the current device

`TokenPair.sessionId` is the id of the refresh row that pair belongs to, so the client can highlight itself:

```tsx
const currentSessionId = tokenPair.sessionId;

{result.items.map((session) => (
  <li key={session.id}>
    <code>{session.id}</code>
    {session.id === currentSessionId ? <span>This device</span> : null}
  </li>
))}
```

Because rotation writes a new row, **`sessionId` changes on every refresh**. Update your stored value from every token pair you receive (login, refresh, issue), or the badge will silently stop matching. If you would rather have a stable per-device identifier, `familyId` is that value — persist the family id from a session lookup and compare on it instead.

## Revoking a session

```ts
await auth.revokeSession({ sessionId: session.id, subject: userId });
```

Two things this does that a plain `revoke` does not:

1. **Ownership check.** The record must exist and its `subject` must match, otherwise `SessionNotFoundError` — mapped to `404`, so the endpoint leaks nothing about other users' session ids.
2. **Family-wide revoke.** It revokes the whole `familyId`, not just the tip. An attacker holding an older token from that chain gets nothing; a partial revoke would leave the chain replayable.

Already-revoked sessions resolve silently, so double-clicking a "Revoke" button is harmless.

| Call | Kills |
| --- | --- |
| `revoke(refreshToken)` | just the token presented (needs the plaintext) |
| `revokeSession({ sessionId, subject })` | the whole family that session belongs to |
| `revokeAllForSubject(subject)` | every family for that user |

Revoking your own current session is allowed and is exactly what "Revoke & sign out" does in `examples/react`: the row disappears, the next refresh fails, and the client falls back to the login screen. Note that the current access token remains valid until it expires — revocation is a refresh-side operation. Clear local tokens client-side so the UI does not linger in a signed-in state.

## Over HTTP

Both routes require `Authorization: Bearer <accessToken>` and resolve the subject from the token.

```http
GET /auth/sessions?page=1&pageSize=20
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9…
```

```json
{
  "items": [
    {
      "id": "9f2c8b41…",
      "familyId": "4ad0f5c2…",
      "createdAt": "2026-08-12T07:20:11.000Z",
      "expiresAt": "2026-09-11T07:20:11.000Z"
    }
  ],
  "pageInfo": {
    "mode": "offset",
    "page": 1,
    "pageSize": 20,
    "total": 2,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  },
  "query": { "mode": "advanced", "sorts": [{ "field": "createdAt", "dir": "desc" }], "page": { "mode": "offset", "page": 1, "pageSize": 20 } }
}
```

Dates arrive as ISO strings over the wire; core returns `Date` objects in-process.

```http
DELETE /auth/sessions/9f2c8b41…
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9…

{ "ok": true }
```

Full route table and status codes in [HTTP adapters](./http.md).

## In React

```tsx
import { useAuthSessions, useRevokeSession, useJwtAuth } from "@eristack/jwt-auth/react";

function Devices() {
  const { status } = useJwtAuth();
  const sessions = useAuthSessions({ pageSize: 10 });   // TanStack Query, auth-gated
  const revoke = useRevokeSession();                     // invalidates the list on success

  if (status !== "authenticated") return null;

  return (
    <ul>
      {sessions.data?.items.map((session) => (
        <li key={session.id}>
          {new Date(session.createdAt).toLocaleString()}
          <button onClick={() => revoke.mutate(session.id)} disabled={revoke.isPending}>
            Revoke
          </button>
        </li>
      ))}
    </ul>
  );
}
```

`useAuthSessions` stays disabled until the client reports `authenticated`, and the revoke mutation invalidates the `["eristack","jwt-auth","sessions"]` key so the list refetches itself. See [Client & React](./client-and-react.md#sessions-with-tanstack-query).

## Housekeeping

Revoked and expired rows accumulate — every refresh leaves one behind. They are harmless (`listActiveBySubject` filters them out) but they grow forever, so prune on a schedule with your own query:

```ts
await db
  .delete(jwtAuthRefreshTokens)
  .where(lt(jwtAuthRefreshTokens.expiresAt, new Date()));
```

Keep expired-but-recent rows if you want an audit trail of rotation; drop them aggressively if you do not. Either way, index `subject` and `family_id` — see [Database](./database.md#indexes).

## Next steps

- [HTTP adapters](./http.md) — the sessions routes in context
- [Client & React](./client-and-react.md) — hooks and cache invalidation
- [Recipes](./recipes.md#recipe-a-devices-screen) — a full devices screen
- [`@eristack/data-grid`](/docs/data-grid) — the query and result contract
