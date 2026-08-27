# Changesets

Pending release notes for `@eristack/*` packages. Full policy: `packages/ai/ai-knowledge/knowledge/dev-conventions.md` (Changesets on `0.x`).

## Authoring rules (CI enforced)

1. **One package per file** — never list ten packages in one changeset; Version PR duplicates the body under every package changelog.
2. **Body = that package only** — no `### @eristack/other-package` sections; no copy-pasted monolith.
3. **Routine features on `0.1.x`: `patch`** — `minor` on `0.1.0+` becomes **`1.0.0`**. Use `minor` only for first publish from `0.0.0` or when you intentionally exit 0.x.

```md
---
"@eristack/money": patch
---

Add `convertAtQuotePerBase` for quote-per-base FX snapshots.
```

Run `pnpm changesets:check` locally before opening a PR.
