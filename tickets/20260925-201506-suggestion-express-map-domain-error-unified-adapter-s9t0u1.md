# Suggestion: Unified Express/Nest mapDomainError adapter

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201506-suggestion-express-map-domain-error-unified-adapter-s9t0u1`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `possible`
- **created:** 2026-09-25T20:15:06.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Dual-target apps map `BackseatVersionConflictError`, `BusinessPolicyDeniedError`, `ForbiddenError`, and app `DomainError` to JSON 409/403/400 in Express middleware. Related tickets shipped `jsonError` on Backseat; Express side is still copy-pasted per consumer.

## User story

As an Express Horizon B app I want one `mapDomainError(err, res)` from Eristack matching Backseat handler envelopes.

## Proposed behavior

- `@eristack/backseat/express` or extend existing express adapter: `createMapDomainError({ onUnknown? })` returns `(err, res) => boolean`.
- Maps: `CONFLICT_VERSION` → 409, `BUSINESS_POLICY_DENIED` → 409, RBAC forbidden → 403.
- Nest variant mirrors Express.

## Proposed API

```ts
export function createMapDomainError(options?: {
  map?: (error: unknown) => { status: number; code: string; message: string } | null;
}): (error: unknown, res: Response) => boolean;
```

## Feasibility rationale

Follow-up to `20260827-141049-suggestion-standard-error-envelope-helper-matching-express--d5663d.md`.

## Implementation sketch

- Lift from Tiga Sekawan `apps/api/src/http/map-domain-error.ts`.
- Wire in workshop proxy example.

## Risks

- App-specific DomainError codes need extension hook.

## Alternatives

- Keep app-owned mapper — works but duplicates.

## Agent handoff

1. Load `@eristack/ai-knowledge#http-errors`.
2. Express adapter + docs; Changeset.

## Notes

Consumer: `apps/api/src/http/map-domain-error.ts`, `workshop-proxy.ts`.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
