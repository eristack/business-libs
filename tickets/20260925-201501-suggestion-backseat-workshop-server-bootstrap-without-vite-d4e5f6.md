# Suggestion: Workshop server bootstrap without Vite / web app import

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201501-suggestion-backseat-workshop-server-bootstrap-without-vite-d4e5f6`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `partial`
- **created:** 2026-09-25T20:15:01.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon B Express mirrors Backseat by booting the same route registration as the browser. Today consumers put `bootWorkshopBackseat` in `apps/web` and import it from `apps/api`, coupling API typecheck to `window`, seed, and Vite paths. Provide a headless **workshop server** bootstrap in `@eristack/backseat`.

## User story

As a dual-target ERP I want `apps/api` to boot Backseat + Drizzle store without depending on the React app package.

## Proposed behavior

- `bootWorkshopServer({ store, baseUrl, registerRoutes, seed? })` initializes Backseat, calls consumer `registerRoutes()` once (idempotent guard optional helper).
- No React, no IndexedDB default on server—consumer passes `createDrizzleBackseatStore(db)`.
- Document pattern: web calls same `registerRoutes` from shared package or re-export.

## Proposed API

```ts
// @eristack/backseat/workshop
export function bootWorkshopServer(options: {
  store: BackseatStore;
  baseUrl?: string;
  registerRoutes: () => void;
  seed?: () => Promise<void>;
}): Backseat;

export function createWorkshopProxy(app: Express, backseat: Backseat): void;
```

(`createWorkshopProxy` may stay app-owned; recipe is enough if bootstrap ships.)

## Feasibility rationale

Thin wrapper over existing `createBackseat` + register pattern; no ERP domain.

## Implementation sketch

- Example in `examples/express-document-erp`.
- dual-target.md section: API package layout.
- Optional: extract proxy from Tiga Sekawan `workshop-proxy.ts` as reference.

## Risks

- Every app’s `registerRoutes` shape differs—library must not own job/invoice routes.
- Duplicate registration if consumer calls bootstrap twice.

## Alternatives

- Monorepo-only shared `packages/backseat-server` per app — does not scale across consumers.
- Keep importing web — forces DOM lib shims (`globalThis.window` checks).

## Agent handoff

1. Load `@eristack/backseat#backseat-core` and `@eristack/ai-knowledge#backseat-then-backend`.
2. Add workshop module + docs; no vertical routes in library.
3. Changeset if new export path.

## Notes

Consumer: `apps/web/src/backseat/server-boot.ts`, `apps/api/src/compose.ts` imports `@tiga-sekawan/web/backseat/server`.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
