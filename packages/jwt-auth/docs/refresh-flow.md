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

1. App authenticates the user (password, SSO, magic link, …)
2. App calls `issueTokens({ subject, claims })`
3. Core returns `{ accessToken, refreshToken, … }` and persists hashed refresh metadata with a new `familyId`

## Refresh (rotation)

1. Client presents refresh token (body and/or cookie)
2. Core looks up hash
3. If missing/expired → `InvalidRefreshTokenError`
4. If already revoked/replaced → **reuse detected** → revoke entire `familyId` → `RefreshTokenReuseError`
5. Otherwise issue a new pair in the same family and mark the old refresh token replaced

## Logout

- `revoke(refreshToken)` — end one session
- `revokeAllForSubject(subject)` — end every refresh family for that user
