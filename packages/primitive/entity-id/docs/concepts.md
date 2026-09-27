# Concepts

## Canonical form

- Lowercase hex with hyphens: `xxxxxxxx-xxxx-7xxx-yxxx-xxxxxxxxxxxx`
- Version nibble **7**; variant **RFC 4122** (`y` ∈ `8`–`b`)

`normalizeEntityId` / `parseEntityId` enforce both.

## Time extraction

`entityIdToUnixMs` reads the leading 48 bits. Clock skew on generate is the app's concern; ids remain sortable by generation time in normal operation.

## Compare

`compareEntityIds` uses string `localeCompare`. For ids produced by `generateEntityId` at different times, order matches time order. Re-parsed ids compare equal to their canonical form via `entityIdEquals`.

## Boundaries

- **Not** display document numbers — `@eristack/doc-number`
- **Not** ULID/CUID — UUID v7 only in v0
- **Not** multi-tenant encoding — app adds `tenantId` columns
