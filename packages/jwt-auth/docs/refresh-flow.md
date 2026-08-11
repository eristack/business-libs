---
title: Refresh-token flow
description: Access JWT + opaque refresh rotation with reuse detection
sidebar_position: 2
---

# Refresh-token flow

## Token types

| Token | Form | Lifetime | Storage |
| --- | --- | --- | --- |
| Access | Signed JWT (HS256) | Short (default 15m) | Client only |
| Refresh | Opaque random secret | Long (default 30d) | Server stores SHA-256 hash |

## Issue

1. Authenticate the user:
   - **Password:** `login({ username, password })` (requires `credentials` store; hashes via scrypt)
   - **SSO / magic link / custom:** verify in the app, then `issueTokens({ subject, claims })`
2. Core returns `{ accessToken, refreshToken, … }` and persists hashed refresh metadata with a new `familyId`

Credentials rows live in `jwt_auth_credentials` with `subject` = app user id (child of `users`, never a replacement for it).

## Refresh (rotation)

1. Client presents refresh token (body and/or cookie)
2. Core looks up hash
3. If missing/expired → `InvalidRefreshTokenError`
4. If already revoked/replaced → **reuse detected** → revoke entire `familyId` → `RefreshTokenReuseError`
5. Otherwise issue a new pair in the same family and mark the old refresh token replaced

## Logout

- `revoke(refreshToken)` — end one session when the client still holds the refresh token
- `revokeAllForSubject(subject)` — end every refresh family for that user

## Sessions (device list)

Active sessions are the non-revoked, non-expired refresh-token tips for a subject.

- `listSessions(subject)` — safe metadata only (`id`, `familyId`, `createdAt`, `expiresAt`); never returns plaintext/hash
- `revokeSession({ sessionId, subject })` — ownership-checked; revokes the whole refresh **family**

HTTP (via REST / Express / Nest), both require `Authorization: Bearer <access>`:

- `GET /auth/sessions`
- `DELETE /auth/sessions/:sessionId`

Token pair responses also include `sessionId` so clients can recognize the current device.
