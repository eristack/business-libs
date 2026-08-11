---
title: @eristack/jwt-auth
description: Canonical JWT access + refresh-token auth primitives
sidebar_position: 1
---

# @eristack/jwt-auth

Pure business auth primitives with layered adapters:

1. **Core** — token cryptography and lifecycle
2. **Drizzle** — persistence for refresh tokens
3. **REST** — headless HTTP actions/middleware
4. **Express / Nest** — thin framework shells
5. **Client / React** — headless frontend state

The package does **not** own passwords, user tables, or UI widgets.
