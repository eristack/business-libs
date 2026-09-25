# Suggestion: Express 5 mount via dispatch instead of splat catch-all

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163555-suggestion-express-5-mount-via-dispatch-instead-of-splat-ca-90fba8`
- **kind:** suggestion
- **package:** `@eristack/rest`
- **feasibility:** `partial`
- **created:** 2026-09-25T16:35:55.014Z
- **reporter:** household

## Summary

Express 5 cannot mount the rest/express * catch-all. Consumers hand-write dispatch(). First-class mountExpress(app, rest, { express: 5 }) or document dispatch as the Express 5 path.

## User story

As an Express 5 app I want to mount @eristack/rest without copying a dispatch middleware.

## Proposed behavior

mountExpress works on Express 5. Unmatched routes call next(). Matched routes write status + JSON body.

## Proposed API

mountExpress(app, rest, { basePath?: string, express?: 4 | 5 }) or dispatch-only adapter

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Reproduce Express 5 * incompatibility in an adapter test
- Add mount path that uses rest.dispatch instead of splat
- Update rest-core skill and an Express 5 example

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/rest`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
