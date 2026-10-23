# AGENTS.md ↔ Intent skills sync (F-011)

**Gate:** `node scripts/check-agents-intent-sync.mjs --ci` (wired as `agents-intent-sync` in `pnpm eristack check` catalog/pr/full profiles).

## What it asserts

1. Every publishable package with a `skills/` folder has a matching `workspace:@eristack/<name>` entry in root `package.json` → `intent.skills` (and no extras).
2. Every skill file’s frontmatter `name:` appears as `- id: "@eristack/<pkg>#<name>"` inside the `<!-- intent-skills:start/end -->` block in `AGENTS.md`.

## When it fails

Run from repo root:

```bash
pnpm exec intent install --map
```

Commit `AGENTS.md` if the map changed. Also add the package to root `devDependencies` + `intent.skills` when shipping a new package with skills (see `knowledge/dev-conventions.md` § Shipping a new package).

**Related:** `scripts/skills-validate.mjs` runs `intent validate` and counts skill files vs Intent registry — complementary, not duplicate.
