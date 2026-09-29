---
title: API reference
---

# API reference

## Core

| Export | Description |
| --- | --- |
| `generateEntityId(unixMs?)` | New v7 id; default `Date.now()` |
| `generateEntityIdAt(ms, random10)` | Deterministic (tests) |
| `parseEntityId` / `normalizeEntityId` | Validate + canonicalize |
| `isValidEntityId` | Boolean guard |
| `entityIdToUnixMs` / `entityIdToDate` | Read embedded time |
| `compareEntityIds` | Lexicographic compare |
| `entityIdEquals` | Normalized equality |
| `EntityIdParseError` | `code: ENTITY_ID_PARSE` |
| `ENTITY_ID_VERSION` | `7` |

## Drizzle

| Export | Description |
| --- | --- |
| `entityIdColumn(dialect, name, options?)` | Column with default generator |

## Zod

| Export | Description |
| --- | --- |
| `entityIdSchema` | Parse to `EntityId` |
