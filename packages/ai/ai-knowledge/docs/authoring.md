---
title: Authoring
description: Add recipes and keep skills discoverable
sidebar_position: 5
---

# Authoring

## Recipe checklist

1. Confirm the package is in the catalog (`packages/<category>/<name>/package.json` publishable).
2. Confirm skill ids exist under that package’s `skills/*/SKILL.md`.
3. Add an entry to `knowledge/recipes.yaml` with unique `id`, `priority`, `triggers`, `rationale`, `packages`.
4. Prefer **product language** triggers (what users say), not internal API names alone.
5. `pnpm knowledge:sync` && `pnpm knowledge:check`.

### Priority guidance

| Range | Use |
| --- | --- |
| 1–9 | Broad “build an ERP app” style recipes |
| 10–20 | Core domain capabilities |
| 25–40 | Adapter / wiring recipes (load after core) |

Lower number wins ties after score.

## Skill frontmatter

Package skills need Intent-compatible frontmatter (`name`, `description`, `metadata`, `sources`). Descriptions should be searchable: include the package name, key APIs, and when to load.

Set `metadata.library_version` to the **same** value as that package’s `package.json` `version` before publish. Skills are **not** independently versioned or released — they ship as files inside the npm tarball (`files` includes `skills/`).

After changing skills or public exports agents should see:

```bash
pnpm knowledge:sync
```

Never hand-edit `src/generated/*` or the `<!-- catalog:* -->` block in `skills/recommend-eristack/SKILL.md`.

## Releasing `@eristack/ai-knowledge`

One Changeset → one package version bump → one npm publish. That publish includes:

| Artifact | Source |
| --- | --- |
| `recommend()` / `loadPlan()` | `src/` |
| Generated catalog + recipes | `src/generated/` (from `pnpm knowledge:sync`) |
| Intent skills | `skills/*/` |
| Knowledge markdown | `knowledge/` |

You do **not** cut a release per skill. Edit skills in-tree, sync the catalog, add a changeset on this package (patch for guidance/catalog refresh; minor if the recommend API or recipe model changes), merge to `main`, then merge the Version Packages PR.

When sibling packages gain skills/recipes, bump **those** packages as usual **and** bump `@eristack/ai-knowledge` so consumers get the regenerated catalog embedded in this package.

## Tooling prompts

The `ai-toolbox` skill (in this package) carries feature-brief prompts and checklists for money/auth/doc-number. Use it when drafting new recipes or agent runbooks.

## Related

- [Catalog sync](./sync.md)
- [Skills](./skills.md)
- [Recipes](./recipes.md)
