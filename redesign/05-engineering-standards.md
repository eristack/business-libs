# Engineering standards (draft)

**Status:** Proposed — becomes mandatory when referenced from [10-enforcement-design.md](./10-enforcement-design.md) and enforced in CI.

## Mandatory (all `@eristack/*` changes)

| Rule | Verification |
| --- | --- |
| String-first money, decimals, wall dates | Code review; no `Number()` on amounts in core |
| User-facing behavior → Changeset | `pnpm eristack check` changesets step |
| Export map matches `dist` | `pnpm build && pnpm exports:check` |
| Runtime `@eristack/*` deps → peers + devDeps | `check-publish-deps.mjs` |
| Docs + skills + recipes + sync same iteration | `pnpm knowledge:sync && pnpm knowledge:check` |
| Cross-cutting facts → one `knowledge/<topic>.md` | `check-knowledge-docs-mirror.mjs` |
| Production persistence = Drizzle unless documented exception | Integration tests for stores that ship `/drizzle` |

## Conditional

| When | Rule |
| --- | --- |
| New publishable package | Full ship checklist (`dev-conventions.md` § Shipping a new package) |
| New public export subpath | exports:check + adapter doc section |
| ERP document routes | Prefer `@eristack/opinion` paths |
| Partner routes | rate-limit → api-key → idempotency guard order |
| Agent-facing API | Recipe entry + Intent skill |

## Testing standard (target)

| Layer | Minimum |
| --- | --- |
| Core | Unit tests for public API; edge cases for parse/normalize |
| Drizzle adapter | At least one sqlite (or harness) test proving insert/list/transaction path |
| Express/Nest/React | Example or package test — not required for every adapter day-one |
| Memory drivers | **Not** imported from app code; move to `@eristack/<pkg>/testing` (program initiative STAB-MEM-*) |

## Versioning

- 0.x semver; peer `^0.1.0` floors per upgrading guide
- Changesets: one package per file; patch on 0.x for user-visible fixes

## Open decisions (need human)

| ID | Question | Default if silent |
| --- | --- | --- |
| D-01 | Block merge on missing drizzle test for new `/drizzle` exports? | Warn first (debottleneck-style), block in phase 3 |
| D-02 | Require `ticket.yaml` on every package? | Keep catalog + triage check only |
