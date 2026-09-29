---
title: Overview
description: Sortable UUID v7 strings for primary keys — generate, parse, compare, and optional Drizzle $defaultFn.
---

# @eristack/entity-id

Sortable **UUID v7** strings for primary keys — generate, parse, compare, and optional Drizzle `$defaultFn`.

## Why v7

| Property | Benefit |
| --- | --- |
| 48-bit Unix ms in the id | List by `id` approximates creation order without a separate index hack |
| Random tail | Unpredictable ids at the API boundary |
| Strict parse | Reject v4 legacy ids when the app standardizes on v7 |

## Exports

| Entry | Role |
| --- | --- |
| `@eristack/entity-id` | Core generate/parse/compare |
| `@eristack/entity-id/drizzle` | `entityIdColumn(dialect, name)` with default generator |
| `@eristack/entity-id/zod` | `entityIdSchema` for APIs |

## Collaboration

Wave 13 compose: load `@eristack/ai-knowledge#party-and-platform-compose` — **entity-id has no sibling deps**. Use on every new Drizzle table; pair with `@eristack/timestamp` for human-facing dates.

## Next

- [Getting started](./getting-started.md)
- [Drizzle](./drizzle.md)
