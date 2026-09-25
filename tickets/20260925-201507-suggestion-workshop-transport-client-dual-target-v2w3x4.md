# Suggestion: Workshop transport client (backseat vs express base URL)

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201507-suggestion-workshop-transport-client-dual-target-v2w3x4`
- **kind:** suggestion
- **package:** `@eristack/jwt-auth`
- **feasibility:** `partial`
- **created:** 2026-09-25T20:15:07.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon B flips React data layer with `VITE_API_MODE=express` and a remote `fetch` to `localhost:3001`. Each app reinvents `workshopFetch`, credentials, and path prefix rules. Extend dual-target docs with an optional thin client helper (like `createJwtAuthClient`).

## User story

As a dual-target ERP I want one client helper for relative `/api` in Backseat mode and absolute API URL in express mode.

## Proposed behavior

- Env-driven: `mode: 'backseat' | 'express'`, `baseUrl`, `credentials: 'include'`.
- Resolves paths consistently (`/api/jobs` vs proxy base).
- Does not replace TanStack Query—transport only.

## Proposed API

```ts
// @eristack/backseat/client or jwt-auth/client pattern
export function createWorkshopClient(options: {
  mode: 'backseat' | 'express';
  baseUrl?: string;
  credentials?: RequestCredentials;
}): { fetch(path: string, init?: RequestInit): Promise<Response> };
```

## Feasibility rationale

Partial — may live in backseat or ai-knowledge example only.

## Implementation sketch

- Example from `apps/web/src/lib/workshop-transport.ts`.
- Cross-link `20260827-141024-suggestion-documented-dual-target-client-same-login-against-4dc222.md`.

## Risks

- Vite env vs Node test env differences.

## Alternatives

- Recipe-only copy-paste — current state.

## Agent handoff

1. Decide package ownership (backseat vs jwt-auth client).
2. Example + docs; optional export.

## Notes

Consumer: `workshop-transport.ts`, `data/client.ts`, QA panel client.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
