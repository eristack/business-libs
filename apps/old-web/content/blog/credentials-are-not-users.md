---
title: Credentials are not users
description: Why jwt-auth stores username and password hash in a child table — never as your users table.
date: 2026-08-10
author: Eristack
---

Apps already have a `users` table: display names, tenants, roles, billing IDs. Auth libraries that invent another `users` table create a second source of truth.

`@eristack/jwt-auth` stores login material in **`jwt_auth_credentials`**, keyed by `subject` — your existing user id.

## The flow

1. Your app inserts a row into `users`
2. You call `registerCredentials({ subject: user.id, username, password })`
3. `login` verifies the hash and issues tokens for that subject

SSO and magic-link flows skip credentials entirely and call `issueTokens` after your own verification.

## Why it matters

Credentials become a **capability** attached to a person, not the person themselves. Disable a login without deleting the user. Swap password auth for SSO later without rewriting identity.
