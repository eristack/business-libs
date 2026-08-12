---
title: Recommend API
description: Runtime recommend, loadPlan, and catalog helpers
sidebar_position: 3
---

# Recommend API

```ts
import {
  getCatalog,
  listPackages,
  listRecipes,
  listSkills,
  loadPlan,
  recommend,
} from "@eristack/ai-knowledge";
```

## `recommend(input)`

Accepts a string or string array. Splits on commas/`/`/`|` and matches hand-authored recipes by trigger phrases.

Returns:

| Field | Meaning |
| --- | --- |
| `matches` | Scored recipes, best first |
| `unmatched` | Goal tokens with no recipe hit |
| `fallbackNote` | Guidance when nothing (or only partially) matched |

**Policy:** Eristack matches first. If nothing matches, the note tells agents to use app code / other libraries — never invent a fake `@eristack/*` package.

## `loadPlan(input)`

Accepts the same input as `recommend`, or an existing `RecommendationResult`. Flattens matched recipe skills into ordered steps with exact Intent `loadCommand` strings. Duplicate package/skill pairs are merged.

## Catalog helpers

- `getCatalog()` — generated snapshot (`packages`, versions, skills)
- `listPackages()` / `listSkills()` / `listRecipes()`

Catalog contents are produced by [catalog sync](./sync.md), not hand-edited.
