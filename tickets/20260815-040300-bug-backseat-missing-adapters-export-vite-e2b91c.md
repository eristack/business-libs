# Bug: Published @eristack/backseat@0.1.0 missing ./adapters export

> Portable Eristack ticket — send this file to the maintainer. An agent can open it and start fixing.

## Meta

- **id:** `20260815-040300-bug-backseat-missing-adapters-export-vite-e2b91c`
- **kind:** bug
- **package:** `@eristack/backseat`
- **observed version:** `0.1.0`
- **created:** 2026-08-15T04:03:00.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

`@eristack/jwt-auth@0.4.0`, `@eristack/doc-number@0.3.0`, and `@eristack/data-grid@0.2.0` import `@eristack/backseat/adapters` (`asDate`, `asNullableDate`, `registerRestLikeRoutes`). Published `@eristack/backseat@0.1.0` does not declare that export. Vite dep pre-bundle fails: `Missing "./adapters" specifier in "@eristack/backseat" package`. `@eristack/ai-knowledge@0.1.4` documents `./adapters` as part of the Backseat 0.1.0 train, but npm `0.1.0` only exports `.`, `./store`, `./react`, `./seeds`.

## Scenario

Consumer Vite + React app wires official spine `./backseat` adapters (`registerJwtAuthBackseat`, `createBackseatDocNumberStores`) after bumping jwt-auth/doc-number to the versions in the 0.1.4 catalog.

## Steps to reproduce

- Install `@eristack/backseat@0.1.0` plus `@eristack/jwt-auth@0.4.0` (or `@eristack/doc-number@0.3.0`).
- Import `@eristack/jwt-auth/backseat` from a Vite React module.
- Run `vite` / `vite --force`. Observe dep-pre-bundle failure before the app loads.

## Expected

`@eristack/backseat` publishes `./adapters` with `asDate`, `asNullableDate`, and `registerRestLikeRoutes` (REST-request bridge for spine `register*Backseat`), matching `docs/backseat.md` / ai-knowledge upgrading notes.

## Actual

Vite:

```
Missing "./adapters" specifier in "@eristack/backseat" package
@eristack/doc-number/dist/chunk-ZRT4XDGE.js: import { asDate } from "@eristack/backseat/adapters"
@eristack/jwt-auth/dist/chunk-NOFYSLAK.js: import { asDate, asNullableDate } from "@eristack/backseat/adapters"
```

`package.json` exports on npm `0.1.0` have no `./adapters` key. Only one version exists on npm (`0.1.0`, published 2026-08-14T06:10:34Z).

## Impact

High for frontend-first / Backseat prototypes: official spine `./backseat` adapters cannot load in Vite. Consumer workaround: alias `@eristack/backseat/adapters` to a local shim.

## Suspects

- `@eristack/backseat` `package.json` `exports` — missing `./adapters`
- Spine packages already import the subpath (jwt-auth, doc-number, data-grid)
- Catalog/ai-knowledge claimed the export shipped with Backseat 0.1.0

## Fix plan

1. Add `./adapters` export (`asDate`, `asNullableDate`, `registerRestLikeRoutes`) and ship a patch of `@eristack/backseat`.
2. Add a Vite/consumer test or example that imports `@eristack/jwt-auth/backseat`.
3. Confirm `pnpm npm view @eristack/backseat exports` includes `./adapters` after publish.

## Agent handoff

- [ ] Reproduce with Vite + jwt-auth/backseat import
- [ ] Export `./adapters` from `@eristack/backseat`
- [ ] Publish patch; consumer can drop the Vite alias shim
