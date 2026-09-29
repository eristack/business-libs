---
"@eristack/drizzle-kit-helpers": patch
---

Fix `dbCredentials.url` — the config helpers returned the literal string `"process.env.DATABASE_URL"` instead of reading the environment variable. `defineEristackDrizzleConfig`, `eristackProdPostgresConfig`, and `eristackTestSqliteConfig` now read `process.env[dbCredentialsEnv]` at call time (empty string when unset). Consumers who worked around this by spreading `dbCredentials` manually can drop the override.
