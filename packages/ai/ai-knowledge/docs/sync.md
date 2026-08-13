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

## HARD RULE — every package iteration

In this monorepo, **docs and ai-knowledge ship together**. Any non-trivial package change must, in the same pass:

1. Update package `docs/`
2. Update Intent `skills/` when guidance/APIs/defaults change
3. Update `knowledge/recipes.yaml` when product language should discover the change
4. Run `pnpm knowledge:sync` and keep `pnpm knowledge:check` green

Do not finish with fresh docs and a stale catalog. Cursor rule: `.cursor/rules/ai-knowledge-sync.mdc`.

Also sync when you:

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

## Versioning note

Intent skills under `skills/` are published **with** `@eristack/ai-knowledge`. Compiling or editing a skill does not create its own npm version — add a Changeset on `@eristack/ai-knowledge` and ship one package release. Keep `metadata.library_version` in each skill equal to `package.json` version at publish time.

## Related

- [Authoring](./authoring.md)
- [Recipes](./recipes.md)
