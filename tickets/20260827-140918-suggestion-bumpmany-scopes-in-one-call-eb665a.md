# Suggestion: bumpMany scopes in one call

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140918-suggestion-bumpmany-scopes-in-one-call-eb665a`
- **kind:** suggestion
- **package:** `@eristack/epoch`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:09:18.251Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Tiga Sekawan wraps Promise.all(scopes.map(epoch.bump)). Cost-sheet writes bump cost-sheets + jobs + dashboard. A first-class bumpMany avoids a consumer helper in every app.

## User story

As a mutation handler I want epoch.bumpMany('jobs','cost-sheets','dashboard') after one write.

## Proposed behavior

bumpMany(scopes: string[]) bumps each; order undefined; empty array no-op. Same store as bump.

## Proposed API

epoch.bumpMany(scopes: readonly string[]): Promise<void>

## Feasibility rationale

In-bounds for bumpMany scopes in one call; proceed with a concrete implementation sketch.

## Implementation sketch

- Loop existing bump; keep bump(scope) unchanged
- Backseat + drizzle stores inherit automatically
- React docs: after createJob

## Risks

- Partial failure (second bump throws) should be documented (all-or-nothing vs best-effort).
- Do not change bump() signature.

## Alternatives

- Consumer `bumpEpochScopes` already in `apps/web/src/backseat/epoch.ts` — we keep it until this ships.

## Agent handoff

1. Load Intent skills for `@eristack/epoch`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Every mutating Backseat route. IMPLEMENTATION §22 epoch table.

### Consumer evidence (Tiga Sekawan)

```ts
export async function bumpEpochScopes(...scopes: string[]) {
  await Promise.all(scopes.map((scope) => epoch.bump(scope)));
}
```

Cost-sheet line write bumps `cost-sheets`, `jobs`, `dashboard`. Invoice issue bumps four scopes. This helper should be library-owned.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
