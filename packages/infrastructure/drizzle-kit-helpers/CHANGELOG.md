# @eristack/drizzle-kit-helpers

## 0.1.1

### Patch Changes

- 899beb6: Fix `dbCredentials.url` — the config helpers returned the literal string `"process.env.DATABASE_URL"` instead of reading the environment variable. `defineEristackDrizzleConfig`, `eristackProdPostgresConfig`, and `eristackTestSqliteConfig` now read `process.env[dbCredentialsEnv]` at call time (empty string when unset). Consumers who worked around this by spreading `dbCredentials` manually can drop the override.

## 0.1.0

### Minor Changes

- 4e2ce6d: Initial release: drizzle-kit config fragments for Eristack monorepos (Wave 13 G2).
