---
title: Recommend API
description: Tokenization, scoring, unmatched goals, and loadPlan
sidebar_position: 3
---

# Recommend API

```ts
import {
  recommend,
  loadPlan,
  getCatalog,
  listPackages,
  listSkills,
  listRecipes,
} from "@eristack/ai-knowledge";
```

## `recommend(input)`

**Input:** `string | string[]`  
**Output:**

```ts
{
  input: string[];           // normalized tokens
  matches: RecommendationMatch[];
  unmatched: string[];       // tokens with no recipe coverage
  fallbackNote: string | null;
}
```

Each match:

```ts
{ recipe: Recipe; score: number; matchedTriggers: string[] }
```

### Normalization

1. Flatten arrays
2. Split each part on `[,;/|]+`
3. `trim` + `toLowerCase`
4. Drop empties

`"Login; invoice totals"` → `["login", "invoice totals"]` as two tokens (space kept inside a segment). Prefer short product nouns as separate segments: `recommend(["login", "invoice", "totals"])`.

### Scoring

For each recipe, for each trigger × token:

| Condition | Score |
| --- | --- |
| `token === trigger` | +4 |
| `token.includes(trigger)` or `trigger.includes(token)` | +2 |
| Plus length bonus | `min(trigger.length, 24) / 24` |

If no trigger matched → recipe discarded.

Then add priority boost: `max(0, 40 - recipe.priority)`. **Lower `priority` number = stronger product routing** (e.g. `erp-app-core` at `5`).

### Sort order

1. Higher `score` first  
2. Then lower `recipe.priority`  
3. Then `recipe.id` localeCompare  

### Unmatched & fallback

- Tokens that never loosely match any **matched** trigger land in `unmatched`.
- `fallbackNote`:
  - no matches → tell the agent **not** to invent a fake `@eristack/*` package
  - partial → keep matched packages first; implement the rest in app code
  - full coverage → `null`

**Policy:** never invent Eristack packages. Unmatched goals are app code or other libraries after stating that clearly.

## `loadPlan(input | RecommendationResult)`

Walks match recipes in order and emits Intent steps:

```ts
{
  packageName: string;
  skillId: string;
  loadCommand: string;
  recipeIds: string[];
  reason: string; // recipe rationale
}
```

Duplicate `package#skill` pairs are **merged** (recipe ids appended). Skill metadata (including `loadCommand`) comes from the generated catalog when present.

## Catalog helpers

| Function | Returns |
| --- | --- |
| `getCatalog()` | Full generated catalog |
| `listPackages()` | Packages without nested skill blobs stripped for listing |
| `listSkills()` | Flat skill list |
| `listRecipes()` | Hand-authored recipes (embedded at sync) |

## Examples

```ts
recommend("jwt refresh");
// → jwt-auth-sessions (and possibly adapters if triggers hit)

recommend("invoices");
// → money-ledger (invoice trigger) — still load money skills, not a fake invoice package

loadPlan(["login", "doc number formats"]);
// → ordered jwt-auth + doc-number skill loads
```
