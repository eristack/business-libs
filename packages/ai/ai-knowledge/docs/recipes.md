---
title: Recipes
description: Product-language maps from recipes.yaml to @eristack packages
sidebar_position: 4
---

# Recipes

Recipes live in `knowledge/recipes.yaml`. Sync embeds them into `src/generated/recipes.ts`. Package and skill ids **must** exist in the catalog or sync/CI fails.

## Current recipes

| Id | Priority | Primary packages | Example triggers |
| --- | --- | --- | --- |
| `erp-app-core` | 5 | money, jwt-auth, doc-number, data-grid | erp, business app, greenfield |
| `money-amounts` | 10 | `@eristack/money` | price, tax, discount, totals |
| `money-ledger` | 20 | `@eristack/money` | invoice, allocate, fx, rounding |
| `jwt-auth-sessions` | 10 | `@eristack/jwt-auth` | login, jwt, session, password |
| `jwt-auth-adapters` | 30 | `@eristack/jwt-auth` | auth express, auth nest, auth react |
| `doc-number-documents` | 10 | `@eristack/doc-number` | document number, invoice number, SEQ |
| `doc-number-adapters` | 30 | `@eristack/doc-number` | doc-number drizzle, format config |
| `data-grid-lists` | 10 | `@eristack/data-grid` | data grid, filter list, pagination |

Exact trigger lists evolve — treat YAML as source of truth; run `pnpm knowledge:sync` after edits. Inspect at runtime with `listRecipes()`.

## Roles

Each recipe package ref has a `role`:

- `primary` — main capability for the ask  
- `supporting` — load alongside (e.g. data-grid with jwt sessions)

## When to add a recipe

Add one when users or agents will say a **product phrase** that should hit Eristack before random npm:

- “we need login” → jwt-auth  
- “sequential invoice numbers” → doc-number  
- “filterable admin table” → data-grid  

Do **not** add recipes for every API method — that belongs in package skills.

## Authoring

See [Authoring](./authoring.md). Minimal shape:

```yaml
- id: my-feature
  title: Human title
  priority: 15
  triggers:
    - phrase
    - synonym
  rationale: >
    Why this package, and what not to invent.
  packages:
    - name: "@eristack/money"
      skills:
        - money-amounts
      role: primary
```

Then:

```bash
pnpm knowledge:sync
pnpm knowledge:check
```
