---
title: Database
description: Drizzle tables and columns.
---

# Database

## Tables

| Table | Purpose |
| --- | --- |
| `{prefix}_payment_intents` | Intent status, amount JSON, gateway refs, idempotency |
| `{prefix}_gateway_events` | Append-only webhook payloads |

## Intent columns

| Column | Notes |
| --- | --- |
| `amount_json` | `Money.toJSON()` — string decimal + ISO currency |
| `metadata_json` | Optional string map for invoice ids, etc. |
| `client_secret` | Stripe Elements / action URL — treat as secret in transit only |
| `gateway_intent_id` | Indexed lookup for webhooks |

## API

```ts
createPaymentManagerTables(dialect: "pgsql" | "mysql" | "sqlite", prefix?: string)
createDrizzlePaymentManagerStore({ db, tables })
```

SQLite dialect is for integration tests (`@internal/test-harness` — see `tests/drizzle.integration.test.ts`).
