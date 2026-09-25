# Suggestion: Drizzle app spine bootstrap bundle (dialect flip)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201504-suggestion-drizzle-app-spine-bootstrap-bundle-m3n4o5`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `needs-decision`
- **created:** 2026-09-25T20:15:04.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Every Eristack app repeats `createCredentialsTable`, `createRbacTables`, `createEpochTables`, doc-number tables, plus app `users` and optional `backseat_documents`. Production cutover needs one **dialect switch** (`sqlite` → `pgsql`). Consider a thin bootstrap helper or canonical recipe—not a new ERP package.

## User story

As a consumer scaffolding Horizon B I want one function or copy-paste recipe for all spine tables + migrations for sqlite and pgsql.

## Proposed behavior

Option A — **recipe only:** `stack-defaults` + `upgrading-eristack` section listing table factories and migration order.

Option B — **`@eristack/app-bootstrap/drizzle`:** `createEristackSpineTables(dialect)` returns named table exports; app adds domain tables.

Option C — **codegen** from `pnpm recommend` — overkill unless many apps request.

## Proposed API

If Option B:

```ts
createEristackSpineTables('pgsql' | 'sqlite'): {
  users: /* app-owned placeholder? */;
  jwtAuthCredentials;
  rbac;
  epoch;
  docNumberFormats;
  docNumberSequences;
  backseatDocuments; // optional flag
}
```

## Feasibility rationale

`needs-decision` on whether library owns `users` table vs app-only (jwt-auth docs say app owns users).

## Implementation sketch

- Start with recipe + example `schema.ts` from Tiga Sekawan `packages/db`.
- If B: peer deps on jwt-auth, rbac, epoch, doc-number drizzle only.

## Risks

- Becomes second ORM if it grows domain tables.
- Version skew across @eristack packages when bundle lags.

## Alternatives

- Each adapter documents tables independently — current state; high copy-paste.

## Agent handoff

1. Maintainer decides A vs B.
2. If recipe: ai-knowledge PR only.
3. If package: new scoped package with Changeset.

## Notes

Sprint: `2026-08-27-production-cutover` (planned). Consumer: `packages/db/src/schema.ts`, `createAppDatabase`.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
