---
title: Tokens & refresh
description: Issuing token pairs, rotation, reuse detection, claims, and JWT configuration
sidebar_position: 5
---

# Tokens & refresh

This is the heart of the package: one short-lived signed JWT for API calls, one long-lived opaque secret for staying logged in, and a rotation scheme that detects stolen refresh tokens.

## The token pair

Every issuing path — `login`, `issueTokens`, `refresh` — returns the same shape:

```ts
interface TokenPair {
  accessToken: string;            // HS256 JWT
  refreshToken: string;           // opaque, 32 random bytes, base64url
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  tokenType: "Bearer";
  sessionId: string;              // id of the refresh record just written
}
```

`sessionId` is the row id of this refresh token, which is what makes "this device" identifiable in a [session list](./sessions.md). It changes on every refresh.

## Issuing without a password

`issueTokens` is the door for every non-password flow: SSO callbacks, magic links, OIDC exchanges, service accounts, admin impersonation, test fixtures. You verify identity your way, then hand over a `subject`.

```ts
const profile = await oidc.exchangeCode(code);           // your integration
const user = await upsertUserFromSso(profile);           // your table

const tokens = await auth.issueTokens({
  subject: user.id,
  claims: { role: user.role, tenantId: user.tenantId },
});
```

| Input | Meaning |
| --- | --- |
| `subject` | **Required.** Your user id. Empty throws `ConfigurationError`. |
| `claims` | Optional extra claims for the access token; also persisted with the refresh record. |
| `familyId` | Optional. Continue an existing family instead of starting a new one. |

Omitting `familyId` (the normal case) starts a **new family** — a new device/session. Pass one only when you are deliberately continuing an existing login, e.g. re-issuing after a claim change without logging the device out.

> **`issueTokens` performs no authentication whatsoever.** It mints credentials for whatever subject you name. Anything that can call it can impersonate any user, which is why the REST `POST /auth/issue` route must be gated by your app in production — see [Security](./security.md#gate-post-authissue).

What happens internally:

1. Generate a `familyId` (unless you passed one) and a refresh record id
2. Generate a 32-byte opaque refresh token
3. Sign the access JWT with `sub`, `iat`, `exp`, `jti`, plus `defaultClaims` and your `claims`
4. `store.save({ …, tokenHash: sha256(refreshToken), revokedAt: null, replacedByTokenId: null, claims })`
5. Return the pair — the plaintext refresh token exists only in this response

## Verifying access tokens

```ts
const verified = await auth.verifyAccessToken(accessToken);
verified.subject;        // `sub`
verified.claims;         // full payload: sub, iat, exp, jti, + yours
verified.token;          // the raw token, echoed back
```

Verification is pure crypto — no store round-trip. It checks the HS256 signature, `exp`, and, when configured, `iss` and `aud`. A payload with no string `sub` is rejected even if the signature is valid.

Every failure mode collapses into `InvalidAccessTokenError`, with the underlying `jose` message preserved for logs:

```ts
try {
  await auth.verifyAccessToken(token);
} catch (error) {
  if (error instanceof InvalidAccessTokenError) {
    // expired · tampered · wrong alg · wrong issuer/audience · missing sub
  }
}
```

Adapters wrap this for you: `createRequireAuth` (framework-free), `createExpressRequireAuth`, and `JwtAuthGuard` all reduce to `401` with a stable code. See [HTTP adapters](./http.md#protecting-your-own-routes).

## Rotation

```ts
const next = await auth.refresh(currentRefreshToken);
// next.refreshToken is new; currentRefreshToken is now dead
```

Step by step:

```text
refresh(token)
   │
   ├─ empty token ─────────────────────────────► InvalidRefreshTokenError
   │
   ├─ hash = sha256(token); store.findByHash(hash)
   │     └─ not found ─────────────────────────► InvalidRefreshTokenError
   │
   ├─ expiresAt <= now ────────────────────────► InvalidRefreshTokenError("Refresh token expired")
   │
   ├─ revokedAt is set  ──► store.revokeFamily(familyId, now)
   │                        └───────────────────► RefreshTokenReuseError
   │
   └─ issue a new pair in the SAME familyId, replaying the stored claims
      then store.markReplaced(oldId, newId, now)
```

Two details worth calling out:

- The **family is preserved**. Rotation does not create a new session; it extends the existing one, and `refreshTokenExpiresAt` slides forward by the full `refreshTokenTtl`. An actively used session effectively never expires, which is the intended behaviour for "remember me".
- `markReplaced` sets both `replacedByTokenId` **and** `revokedAt` on the old row. That is why a replayed token looks identical to a revoked token — and why the reuse branch catches replays.

### Handle rotation atomically on the client

Because the old token dies the moment `refresh` succeeds, a client that loses the response has lost the session. Persist the new token before you use it, and never run two refreshes concurrently for the same session — the built-in [client](./client-and-react.md#automatic-refresh) de-duplicates in-flight refreshes for exactly this reason.

## Reuse detection

Presenting a refresh token that has already been revoked or replaced triggers the security response:

```ts
import { RefreshTokenReuseError } from "@eristack/jwt-auth";

try {
  const next = await auth.refresh(stored.refreshToken);
} catch (error) {
  if (error instanceof RefreshTokenReuseError) {
    // The whole family is now revoked. Clear local tokens and force a fresh login.
    await storage.clear();
    redirectToLogin();
  }
}
```

Why revoke the entire family rather than just reject the request? A replay means two parties hold tokens from the same chain, and the library cannot tell which one is the legitimate user. Rejecting only the replay would leave a thief with a working chain. Killing the family costs the honest user one login and costs the attacker everything.

> **Do not swallow this error.** Treating it as a soft "token invalid" is the single most common mistake with rotation: the session is already dead server-side, so retrying or ignoring it produces a confusing loop instead of a login prompt.

False positives look like reuse but are not attacks — a client that refreshed twice in parallel, or restored an old token from a backup. The response is the same by design: re-authenticate. Serializing refreshes on the client keeps this rare.

## Revoking

```ts
await auth.revoke(refreshToken);            // this device, needs the token
await auth.revokeAllForSubject(userId);     // every device for that user
```

| Method | Scope | Needs | Behaviour when nothing matches |
| --- | --- | --- | --- |
| `revoke(refreshToken)` | the single token presented | the plaintext token | silent no-op |
| `revokeSession({ sessionId, subject })` | the whole **family** | a session id + owner | `SessionNotFoundError` |
| `revokeAllForSubject(subject)` | every family for the user | the user id | silent no-op |

`revoke` is idempotent and never throws for unknown or already-revoked tokens, which is what lets `POST /auth/logout` always answer `200` — a logout that fails is worse than a logout that no-ops.

Note the asymmetry: `revoke` kills one token (the tip), while `revokeSession` kills the family. For "log out this device" from a session list, prefer `revokeSession`; it leaves nothing usable behind. See [Sessions](./sessions.md#revoking-a-session).

## Claims

Three sources merge into every access token, later winning over earlier:

```text
config.defaultClaims  →  per-call claims  →  reserved claims (sub, iat, exp, jti, iss, aud)
```

```ts
const auth = createJwtAuth({
  accessSecret,
  store,
  defaultClaims: { ver: 1 },
  issuer: "acme-erp",
  audience: "acme-api",
});

await auth.issueTokens({ subject: "user_1", claims: { role: "admin" } });
// payload: { ver: 1, role: "admin", sub: "user_1", iat, exp, jti, iss, aud }
```

`sub` is always the `subject` you passed — a `claims.sub` cannot override it.

### Claims across refresh

The claims you pass at issue time are **persisted with the refresh record** and replayed into every rotated access token. That keeps sessions self-contained: refresh needs no read of your users table.

The trade-off is staleness. A user demoted from `admin` keeps `role: "admin"` in refreshed tokens until the session ends, because nothing re-reads your database.

Pick a strategy deliberately:

| Strategy | How | Cost |
| --- | --- | --- |
| Thin tokens | Put only `sub` in the token; load roles per request | A lookup (usually cached) per request |
| Revoke on change | Call `revokeAllForSubject` when roles change | User must log in again |
| Re-issue on change | `issueTokens({ subject, familyId })` with fresh claims | You must track the family id |
| Accept staleness | Keep TTL short and let claims lag | Bounded by `accessTokenTtl` |

For most ERP-style apps, thin tokens plus a cached permission lookup is the safest default: authorization stays correct the moment you change it.

## JWT configuration

| Option | Default | Notes |
| --- | --- | --- |
| `accessSecret` | *required* | `string` of **≥ 16 characters**, or a `Uint8Array` key. Shorter strings throw `ConfigurationError`. |
| `accessTokenTtl` | `"15m"` | Duration string or ms |
| `refreshTokenTtl` | `"30d"` | Duration string or ms |
| `issuer` | `undefined` | Sets `iss` and requires it on verify |
| `audience` | `undefined` | Sets `aud` (string or array) and requires it on verify |
| `defaultClaims` | `undefined` | Merged into every access token |
| `clock` | system | `{ now(): Date }` — inject for deterministic tests |

Algorithm is **HS256**, fixed. Verification allows only HS256, so an attacker cannot downgrade to `none` or swap to an asymmetric algorithm. If you need RS256/ES256 for cross-service verification, that is a feature request rather than a config flag — today, services that verify tokens must share the symmetric secret.

Durations accept `number` (milliseconds) or `` `${number}${"ms"|"s"|"m"|"h"|"d"}` ``. Anything else throws `ConfigurationError`.

```ts
accessTokenTtl: "15m"
accessTokenTtl: 900_000     // identical
refreshTokenTtl: "30d"
```

> Setting `issuer` and `audience` costs nothing and stops tokens minted for one environment or service from validating in another. Set them.

### Rotating the secret

Changing `accessSecret` invalidates every outstanding access token — users see one failed request, then their client refreshes and recovers, because refresh tokens are opaque and unaffected by the JWT key. That makes secret rotation a mildly disruptive but safe operation. Rotate immediately if a secret leaks: without it, a leaked secret lets anyone forge tokens for any subject.

## Testing time

Inject a clock and both TTL boundaries become deterministic:

```ts
let now = new Date("2026-01-01T00:00:00Z");
const auth = createJwtAuth({
  accessSecret: "test-secret-at-least-16",
  store: createMemoryRefreshTokenStore(),
  clock: { now: () => now },
  accessTokenTtl: "1m",
  refreshTokenTtl: "10m",
});

const pair = await auth.issueTokens({ subject: "user_1" });

now = new Date(now.getTime() + 11 * 60_000);
await expect(auth.refresh(pair.refreshToken)).rejects.toThrow(InvalidRefreshTokenError);
```

Note that JWT verification uses `jose`, which reads real time for `exp` — the injected clock controls issuance and store logic, so exercise access-token expiry with short real TTLs rather than clock travel.

## Next steps

- [Sessions](./sessions.md) — turning refresh tips into a device list
- [HTTP adapters](./http.md) — `/refresh`, `/logout`, transports, error mapping
- [Client & React](./client-and-react.md) — automatic refresh with skew
- [Security](./security.md) — reuse handling, secrets, cookies
