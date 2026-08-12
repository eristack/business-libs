---
title: Catalog sync
description: Keep ai-knowledge aligned with sibling @eristack packages
sidebar_position: 4
---

# Catalog sync

Package facts in `@eristack/ai-knowledge` are **generated** from sibling packages in this monorepo so agents do not rely on stale skill lists.

## Sources of truth

| Data | Source | Updated by |
| --- | --- | --- |
| Package name, version, description, adapters | `packages/*/package.json` | `pnpm knowledge:sync` |
| Skill ids + descriptions | `packages/*/skills/*/SKILL.md` | `pnpm knowledge:sync` |
| Feature recipes | `packages/ai-knowledge/knowledge/recipes.yaml` | Humans (+ validated by sync) |
| Stack / workflow / toolbox prose | `knowledge/*.md` | Humans |

## Commands

From the monorepo root:

```bash
pnpm knowledge:sync    # regenerate catalog + embedded recipes + skill catalog section
pnpm knowledge:check   # fail if generated output drifts (CI)
```

Package-local equivalents:

```bash
pnpm --filter @eristack/ai-knowledge sync
pnpm --filter @eristack/ai-knowledge sync:check
```

## When to run sync

Run sync when you:

- Add or rename an `@eristack/*` package
- Add, remove, or change Intent skill frontmatter
- Change package version/description/exports that agents should see
- Edit `knowledge/recipes.yaml`

If a new capability should be **discoverable by product language**, also add triggers to `recipes.yaml`.

## CI

`.github/workflows/ci.yml` runs `pnpm knowledge:check` so PRs cannot merge with a stale generated catalog or broken recipe references.

## Generated files (do not hand-edit)

- `src/generated/catalog.ts`
- `src/generated/recipes.ts`
- Catalog block between `<!-- catalog:start -->` and `<!-- catalog:end -->` in `skills/recommend-eristack/SKILL.md`
