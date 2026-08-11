---
title: @eristack/jwt-auth
description: Canonical JWT access + refresh-token auth primitives
sidebar_position: 1
---

# @eristack/jwt-auth

Pure business auth primitives with layered adapters:

1. **Core** — token cryptography, credential verify/hash, session lifecycle
2. **Drizzle** — persistence for refresh tokens **and** credentials
3. **REST** — headless HTTP actions/middleware
4. **Express / Nest** — thin framework shells
5. **Client / React** — headless frontend state

The package does **not** own a `users` table, UI widgets, database connections,
or environment/config loading. Username/password hashes live in
`jwt_auth_credentials` (default), a **child of the app's users** via `subject`.

**Injection rule:** adapters accept instances (or getters/callbacks) from the
app — `store` / `credentials` / Drizzle `db`, Express/`jwtAuth`, Nest `useFactory`
deps, client `baseUrl` + `storage` (+ optional `fetch` / `getHeaders`). Examples
under `examples/` show app-side wiring.
