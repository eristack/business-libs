# ai-knowledge release prep

## Versioning model

- **One npm package version** (`@eristack/ai-knowledge@x.y.z`) ships all Intent skills, `knowledge/`, and generated catalog/recipes.
- Skills are **not** individually versioned or published.
- `metadata.library_version` in each `SKILL.md` should match `package.json` version at publish.

## Release checklist

1. `pnpm knowledge:sync` && `pnpm knowledge:check`
2. `pnpm --filter @eristack/ai-knowledge test` && `build`
3. Align skill `library_version` to current `package.json` (bump again when Changesets versions the package)
4. Changeset on `@eristack/ai-knowledge` (patch = catalog/skills/docs; minor = recommend API / recipe schema)
5. Human merges feature PR → Version Packages PR → npm publish

## Pending changeset

`.changeset/ai-knowledge-release-prep.md` → next patch after `0.1.1`.
