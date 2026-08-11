---
title: Adapters
description: Drizzle, REST, Express, Nest, client, and React entry points
sidebar_position: 3
---

# Adapters

## Drizzle dialects

`createRefreshTokenTable(dialect)` supports:

- `pgsql`
- `mysql`
- `sqlite`

Columns: `id`, `subject`, `token_hash`, `family_id`, `expires_at`, `revoked_at`, `created_at`, `replaced_by_token_id`, `claims`.

## REST transport

`refreshTokenTransport`:

- `body` — read/write refresh token in JSON body
- `cookie` — HttpOnly cookie only
- `body-or-cookie` — accept either; set cookie on success (default)

## Framework shells

Express and Nest only map their request/response types onto `@eristack/jwt-auth/rest`. Business rules stay in core.

## Frontend

- `/client` owns transport + storage + proactive refresh
- `/react` is headless: provider + hooks, no components with UI
