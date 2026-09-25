# Suggestion: Dual-target API mirror contract testing (routes + smoke CLI)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201502-suggestion-dual-target-api-mirror-contract-testing-cli-g7h8i9`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `partial`
- **created:** 2026-09-25T20:15:02.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon B completes when Express returns the same shapes as Backseat. `api.listRoutes()` / `routesSnapshot()` exist but consumers hand-write smoke scripts. Provide a **testing recipe + optional CLI** to diff registered routes and probe GET endpoints after login.

## User story

As a dual-target ERP I want CI to fail when Express drops a Backseat route or changes grid envelope shape.

## Proposed behavior

- Export stable JSON schema for `routesSnapshot()` (method, path, name).
- CLI or script template: `eristack-routes snapshot --out routes.json` and `eristack-routes check --against routes.json`.
- Recipe: login → bearer token → foreach safe GET route assert not 404; grids assert `items`, `pageInfo`, `query`.

## Proposed API

Docs-first; optional `@eristack/backseat/testing` with:

```ts
export function assertDataGridEnvelope(body: unknown): void;
export function routesSnapshotSchema(): z.ZodType; // or JSON Schema
```

## Feasibility rationale

Builds on shipped `listRoutes()` ticket (`20260827-140852-suggestion-export-registered-routes-and-handler-snapshots-f-de0821.md`).

## Implementation sketch

- Example `scripts/express-api-mirror.mjs` from Tiga Sekawan in `examples/express`.
- ai-knowledge `derive-backend-checklist` links smoke commands.
- Do not run destructive POSTs in default template.

## Risks

- Snapshots include environment-specific routes.
- Handler bodies not compared—only registration and coarse GET smoke.

## Alternatives

- Full golden JSON per endpoint — too heavy for library; app-owned.
- Playwright only — slower; HTTP smoke still valuable for API package.

## Agent handoff

1. Load `@eristack/backseat#backseat-core`.
2. Recipe + example script; CLI optional.
3. Cross-link `jwt-auth` dual-target login in example.

## Notes

Consumer: `scripts/express-api-mirror.mjs`, `scripts/contract-api-spine.mjs`, `pnpm test:api-mirror`.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
