# Suggestion: Documented dual-target client: same login against Backseat or Express

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141024-suggestion-documented-dual-target-client-same-login-against-4dc222`
- **kind:** suggestion
- **package:** `@eristack/jwt-auth`
- **feasibility:** `partial`
- **created:** 2026-08-27T14:10:24.218Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Horizon A login is Backseat jwt-auth; Horizon B flips to Express. createJwtAuthClient exists but the flip (baseUrl, cookie vs body refresh) is tribal knowledge. A short adapter note plus identical path names /auth/login would save a sprint of glue.

## User story

As Tiga Sekawan I want one auth client module with baseUrl switched from /api (Backseat) to http://localhost:3001.

## Proposed behavior

Docs + example: same createJwtAuthClient options; Backseat registerJwtAuthBackseat and createJwtAuthRouter share paths. Flag refreshTokenTransport.

## Proposed API

No new core API unless paths already diverge; document registerJwtAuthBackseat vs createJwtAuthRouter parity matrix

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- upgrading-eristack or jwt-auth-adapters: parity table
- React JwtAuthProvider baseUrl from env

## Risks

- refreshTokenTransport body vs cookie must be identical on both adapters or documented as a flip tax.
- CORS when flipping from same-origin Backseat /api to localhost:3001.

## Alternatives

- Two auth clients (what we will do if docs stay tribal).

## Agent handoff

1. Load Intent skills for `@eristack/jwt-auth`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Horizon A uses Backseat jwt-auth (apps/web/src/backseat/auth.ts). Horizon B Express createJwtAuthRouter. Flip is sprint derive-backend task flip-client.

### Consumer evidence (Tiga Sekawan)

Web already has JwtAuthProvider + backseatHandle('/api'). IMPLEMENTATION §4b: UI must not care which adapter is behind /api.

jwt-auth@0.4.2 has backseat + express adapters. A parity matrix (paths, status codes, refresh) in jwt-auth-adapters / upgrading-eristack would save the derive-backend sprint from path drift (`/auth/login` vs `/login`).

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
