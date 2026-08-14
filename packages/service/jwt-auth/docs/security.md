---
title: Security
description: Production hardening for issue, refresh reuse, cookies, storage, and password change
sidebar_position: 11
---

# Security

Ship these checks before production. The library gives you rotation and hashing; **authorization and transport choices are yours**.

## Protect `POST /issue`

`issueTokens` / `POST /issue` mint a full session for any `subject` you pass. That is correct for SSO callbacks and server-side login handlers. It is catastrophic if left open on the public internet.

| Environment | Guidance |
| --- | --- |
| Password app | Prefer `POST /login` only; omit or admin-gate `/issue` |
| SSO callback | Call `issueTokens` in your callback after verifying the IdP assertion |
| Dev / demos | Open `/issue` is fine; do not copy that into prod routes |

## Refresh token reuse

When a **revoked or already-rotated** tip is presented:

1. The whole **family** is revoked (`revokeFamily`).
2. Core throws `RefreshTokenReuseError`.
3. REST maps that to **HTTP 401**.

Treat reuse as theft of a leaked refresh token (or a race after logout). Force a full re-login. Do not silently issue a new family for that tip.

## Access secret

- HS256 only.
- `accessSecret` must be **≥ 16 characters** (`ConfigurationError` otherwise).
- Store it in a secret manager; never commit it; rotate with a deliberate cutover plan (short access TTL limits blast radius).

## Cookies

If `refreshTokenTransport` is `cookie` or `body-or-cookie`:

| Flag | Recommendation |
| --- | --- |
| `HttpOnly` | Always (default) |
| `Secure` | Always in production HTTPS |
| `SameSite` | `lax` default; `strict` if your UX allows |
| CSRF | Required if you use cookie refresh from a browser with cross-site POSTs |

Access tokens should stay out of cookies unless you have a deliberate BFF design.

## Browser storage

| Storage | Risk |
| --- | --- |
| Memory only | Safest against XSS persistence; lost on refresh |
| `sessionStorage` / `localStorage` | XSS can exfiltrate; pair with short access TTL + rotation |
| HttpOnly refresh cookie | Refresh harder to steal via XSS; still need CSRF plan |

The client accepts an injected `storage` — pick consciously. See [Client & React](./client-and-react.md).

## Password change does not revoke sessions

After `changePassword`, existing refresh families remain valid until expiry or explicit revoke. If your threat model says “password change logs out other devices”:

```ts
await auth.changePassword({ … });
await auth.revokeAllForSubject(subject);
```

## Credentials table

- Never store plaintext passwords — scrypt hashes only (`hashPassword` / `verifyPassword`).
- Hashing is **isomorphic** (same scrypt output in Node and the browser) — safe for Vite + Backseat in-browser REST; no import-time Node `crypto.scrypt`.
- Username is normalized (trim + lower) before uniqueness checks.
- One credential row per `subject`; do not invent parallel password stores.
- Disable compromised accounts at the credential store (and revoke families).

## Sessions list is metadata only

`listSessions` / `sessionDataGridSchema` expose `id`, `familyId`, `createdAt`, `expiresAt` — **never** the refresh secret or hash. Safe to show in a devices UI.

## Checklist

- [ ] `/issue` gated or removed in production password apps
- [ ] Access secret ≥ 16 chars, from a secret store
- [ ] Refresh transport chosen (body vs cookie) with CSRF considered
- [ ] Reuse → 401 → force re-login in the client
- [ ] Password change policy includes `revokeAllForSubject` if required
- [ ] HTTPS everywhere in production
- [ ] Examples’ demo secrets not reused
