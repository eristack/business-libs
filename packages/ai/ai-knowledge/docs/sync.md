---
title: Catalog sync
description: knowledge:sync, generated files, and CI knowledge:check
sidebar_position: 8
---

# Catalog sync

The catalog is **generated** from publishable packages under `packages/<category>/`. Recipes are **hand-authored** in YAML and embedded at sync time.

## Commands

```bash
pnpm knowledge:sync    # regenerate catalog + recipes + recommend-eristack catalog block
pnpm knowledge:check   # CI: fail if generated output is stale
```

## What sync writes

| Path | Content |
| --- | --- |
| `src/generated/catalog.ts` | Packages, versions, skills, adapters |
| `src/generated/recipes.ts` | Embedded `recipes.yaml` |
| `skills/recommend-eristack/SKILL.md` | `<!-- catalog:* -->` block only |

## Do not hand-edit

- Anything under `src/generated/`
- The catalog fence inside `recommend-eristack`

Edit sources instead: package `package.json` / skills, or `knowledge/recipes.yaml`.

## When you must sync

- Add/remove a publishable package under `packages/*/*`
- Change skill ids or descriptions agents should see
- Add/change a recipe
- Change public export surface that the catalog advertises

## Failure modes

| Symptom | Fix |
| --- | --- |
| `knowledge:check` fails in CI | Run `knowledge:sync` and commit generated files |
| Recipe references unknown package/skill | Fix YAML ids to match catalog |
| Stale recommend-eristack catalog | Sync after skill edits |

## Related

- [Authoring](./authoring.md)
- [Recipes](./recipes.md)
