---
title: Database (Drizzle)
description: Refresh-token and credential tables for pgsql, mysql, and sqlite — and the foreign key you own
sidebar_position: 8
---

# Database (Drizzle)

Two tables, both optional in the sense that they are just implementations of the [store ports](./concepts.md#stores-are-ports). The design rule:

> **Your app owns the connection, the migrations, and the `users` table. The package owns the row shapes and the queries against them.**

```bash
pnpm add drizzle-orm
# plus your driver: postgres | mysql2 | better-sqlite3 | …
```

## Dialects

```ts
import {
  createRefreshTokenTable,
  createCredentialsTable,
  createDrizzleRefreshTokenStore,
  createDrizzleCredentialStore,
} from "@eristack/jwt-auth/drizzle";
```

Supported dialects: `"pgsql"` | `"mysql"` | `"sqlite"`.

> **The Postgres dialect is `"pgsql"`, not `"pg"` or `"postgres"`.** An unknown value throws at table-creation time. The same three names are used across every Eristack package, including [`@eristack/data-grid`](/docs/data-grid).

Dialect-specific factories are exported when you prefer explicit types over the overloaded helper:

| Generic | Explicit |
| --- | --- |
| `createRefreshTokenTable("pgsql")` | `createPgsqlRefreshTokenTable()` |
| `createRefreshTokenTable("mysql")` | `createMysqlRefreshTokenTable()` |
| `createRefreshTokenTable("sqlite")` | `createSqliteRefreshTokenTable()` |
| `createCredentialsTable("pgsql")` | `createPgsqlCredentialsTable()` |
| `createCredentialsTable("mysql")` | `createMysqlCredentialsTable()` |
| `createCredentialsTable("sqlite")` | `createSqliteCredentialsTable()` |

Both helpers take an optional table name as a second argument.

## Table names

| Helper | Default table | Rename with |
| --- | --- | --- |
| `createRefreshTokenTable` | `jwt_auth_refresh_tokens` | `createRefreshTokenTable("pgsql", "auth_refresh_tokens")` |
| `createCredentialsTable` | `jwt_auth_credentials` | `createCredentialsTable("pgsql", "auth_logins")` |

> **Never name the credentials table `users`.** It is a child of your users table, holding one login per user — not the user itself. `createCredentialsTable("pgsql", "users")` compiles and will quietly wreck your schema. See [Concepts](./concepts.md#users-vs-credentials-vs-refresh-families).

## Your schema

```ts
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import {
  createCredentialsTable,
  createRefreshTokenTable,
} from "@eristack/jwt-auth/drizzle";

/** App-owned. jwt-auth never touches this table. */
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  email: text("email").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
});

/** Child of `users` via `subject`. */
export const jwtAuthCredentials = createCredentialsTable("sqlite");

export const jwtAuthRefreshTokens = createRefreshTokenTable("sqlite");
```

Keep these next to your other tables so one `drizzle-kit generate` covers everything.

## `jwt_auth_refresh_tokens`

| Column | pgsql | mysql | sqlite | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` PK | `varchar(64)` PK | `text` PK | Refresh record id; this is `sessionId` |
| `subject` | `text` not null | `varchar(255)` not null | `text` not null | Your user id |
| `token_hash` | `text` not null **unique** | `varchar(64)` not null **unique** | `text` not null **unique** | SHA-256 hex — never plaintext |
| `family_id` | `text` not null | `varchar(64)` not null | `text` not null | Groups one device's rotation chain |
| `expires_at` | `timestamptz` not null | `datetime` not null | `integer` (ms) not null | |
| `revoked_at` | `timestamptz` null | `datetime` null | `integer` (ms) null | Set by revoke **and** by rotation |
| `created_at` | `timestamptz` not null | `datetime` not null | `integer` (ms) not null | |
| `replaced_by_token_id` | `text` null | `varchar(64)` null | `text` null | Forward pointer in the chain |
| `claims` | `jsonb` null | `json` null | `text` (json mode) null | Claims replayed on refresh |

Rows are append-only in practice: rotation inserts a new row and updates the old one's `replaced_by_token_id` and `revoked_at`.

> `token_hash` is unique, which is your last line of defence against a store bug that would let one refresh secret map to two sessions.

## `jwt_auth_credentials`

| Column | pgsql | mysql | sqlite | Notes |
| --- | --- | --- | --- | --- |
| `id` | `text` PK | `varchar(64)` PK | `text` PK | |
| `subject` | `text` not null **unique** | `varchar(255)` not null **unique** | `text` not null **unique** | Your user id — one credential per user |
| `username` | `text` not null **unique** | `varchar(255)` not null **unique** | `text` not null **unique** | Stored lowercased and trimmed |
| `password_hash` | `text` not null | `varchar(255)` not null | `text` not null | scrypt, `scrypt$N$r$p$salt$hash` |
| `created_at` | `timestamptz` not null | `datetime` not null | `integer` (ms) not null | |
| `updated_at` | `timestamptz` not null | `datetime` not null | `integer` (ms) not null | Bumped on password change |
| `disabled_at` | `timestamptz` null | `datetime` null | `integer` (ms) null | Non-null blocks login |

There is no email, name, or profile column. That data belongs in your `users` table.

## The foreign key is yours

The helpers emit standalone tables with no reference to `users`, because the package cannot know your table or column names. Add the constraint yourself — either in your Drizzle schema or in a migration:

```sql
ALTER TABLE jwt_auth_credentials
  ADD CONSTRAINT jwt_auth_credentials_subject_fkey
  FOREIGN KEY (subject) REFERENCES users (id) ON DELETE CASCADE;

ALTER TABLE jwt_auth_refresh_tokens
  ADD CONSTRAINT jwt_auth_refresh_tokens_subject_fkey
  FOREIGN KEY (subject) REFERENCES users (id) ON DELETE CASCADE;
```

`ON DELETE CASCADE` is usually right: deleting a user should take their login and their sessions with it. If you soft-delete users instead, skip the cascade and revoke explicitly:

```ts
await auth.revokeAllForSubject(userId);
const record = await credentialStore.findBySubject(userId);
if (record) await credentialStore.disable(record.id, new Date());
```

> Without a foreign key, nothing stops an orphaned credential row from surviving a deleted user — and `login` would happily issue tokens for a `subject` that no longer exists. Add the constraint.

## Wiring the stores

```ts
import { drizzle } from "drizzle-orm/node-postgres";
import { createJwtAuth } from "@eristack/jwt-auth";
import {
  createDrizzleCredentialStore,
  createDrizzleRefreshTokenStore,
} from "@eristack/jwt-auth/drizzle";

const db = drizzle(appConfig.databaseUrl);   // your connection, your pool

const auth = createJwtAuth({
  accessSecret: appConfig.jwtAccessSecret,
  store: createDrizzleRefreshTokenStore({
    dialect: "pgsql",
    db,
    table: jwtAuthRefreshTokens,
  }),
  credentials: createDrizzleCredentialStore({
    dialect: "pgsql",
    db,
    table: jwtAuthCredentials,
  }),
});
```

Both factories take exactly `{ dialect, db, table }`. The `db` handle is typed structurally (`insert` / `select` / `update`), so any dialect's Drizzle client injects without casts, and a test double is easy to hand-roll.

The adapters run plain queries and nothing else — no migrations, no connection management, no transactions of their own. If you need a session write to participate in a larger transaction, construct a store bound to your transaction handle (`tx`) for that call.

## Indexes

The default tables declare primary keys and the unique constraints above. Add indexes for the access patterns:

```sql
CREATE INDEX jwt_auth_refresh_tokens_subject_idx
  ON jwt_auth_refresh_tokens (subject);

CREATE INDEX jwt_auth_refresh_tokens_family_idx
  ON jwt_auth_refresh_tokens (family_id);

CREATE INDEX jwt_auth_refresh_tokens_expires_idx
  ON jwt_auth_refresh_tokens (expires_at);
```

Why each one:

| Query | Triggered by | Wants |
| --- | --- | --- |
| `WHERE token_hash = ?` | every `refresh` and `revoke` | the existing unique index |
| `WHERE subject = ? AND revoked_at IS NULL AND expires_at > ?` | `listSessions`, `revokeAllForSubject` | `subject` |
| `WHERE family_id = ? AND revoked_at IS NULL` | `revokeSession`, reuse detection | `family_id` |
| `WHERE expires_at < ?` | your cleanup job | `expires_at` |

A composite `(subject, revoked_at, expires_at)` is worth it once one user can accumulate many sessions.

## Custom tables

The stores accept any table whose properties match the expected names, so you can declare the table yourself and add columns — `ip_address`, `user_agent`, `tenant_id`. Two constraints: keep every required property with a compatible type, and make your additions nullable or defaulted, because the store's `save` only writes the columns it knows about.

```ts
export const jwtAuthRefreshTokens = pgTable("jwt_auth_refresh_tokens", {
  // the required shape, same names and types as the helper produces
  id: text("id").primaryKey(),
  subject: text("subject").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  familyId: text("family_id").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true, mode: "date" }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).notNull(),
  replacedByTokenId: text("replaced_by_token_id"),
  claims: jsonb("claims").$type<Record<string, unknown>>(),

  // yours — nullable, populated by your own handler after issuing tokens
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
});
```

Fill the extra columns in your own code (you have the request context; core does not), keyed by the `sessionId` returned in the token pair.

For a fully different backend — Redis, Prisma, DynamoDB — implement `RefreshTokenStore` and `CredentialStore` directly. The interfaces are eight and five methods respectively, and `createMemoryRefreshTokenStore` in the source is a readable reference implementation.

## Cleanup

Rotation leaves revoked rows behind forever. They are filtered out of every query, but prune them so the table does not grow without bound:

```ts
import { lt } from "drizzle-orm";

await db
  .delete(jwtAuthRefreshTokens)
  .where(lt(jwtAuthRefreshTokens.expiresAt, new Date()));
```

Run it nightly. Keep a longer retention window if you want an audit trail of rotations; there is nothing sensitive in the rows, since only hashes are stored.

## Testing

Use SQLite plus the memory stores rather than mocking:

```ts
// unit tests — no database at all
const auth = createJwtAuth({
  accessSecret: "test-secret-at-least-16",
  store: createMemoryRefreshTokenStore(),
  credentials: createMemoryCredentialStore(),
  clock: { now: () => frozenNow },
});
```

```ts
// integration tests — real SQL, same code path as production
const db = drizzle(new Database(":memory:"));
const store = createDrizzleRefreshTokenStore({ dialect: "sqlite", db, table });
```

`examples/express` follows the second pattern with a file-backed SQLite database and app-owned migrations.

## Next steps

- [HTTP adapters](./http.md) — expose the routes over Express or Nest
- [Sessions](./sessions.md) — what `listSessions` reads from these rows
- [Recipes](./recipes.md) — full wiring, including Nest `registerAsync`
- [Security](./security.md) — retention, revocation, secrets
