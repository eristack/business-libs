# @eristack/ai-dev

## 0.1.2

### Patch Changes

- b793eed: Add features check profile, dev_knowledge_check MCP tool, backlog hint on plan JSON, and integration profile.

## 0.1.1

### Patch Changes

- cb62643: Add `eristack check --profile examples` for example app typecheck only.
- fcba3c1: Wire Drizzle integration tests into CI: new `integration` check profile, included in `pr` and PR `eristack ci` drift path. Fix `checksForProfile({ only })` so explicit drift checks (e.g. integration) run outside catalog profile. Print full captured stderr on `eristack ci` failures.

## 0.1.0

### Minor Changes

- d94a689: Add `@eristack/ai-dev`: unified `eristack` CLI (`plan`, `check` profiles, `sync`), compact JSON + MCP (`dev_plan`, `dev_check`, `dev_packages`). Consolidate package walker and CI into one workflow; root `pnpm ci` and GitHub CI use check profiles.
