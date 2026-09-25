# Suggestion: Vite + Express login path wiring example

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163606-suggestion-vite-express-login-path-wiring-example-5b83a9`
- **kind:** suggestion
- **package:** `@eristack/jwt-auth`
- **feasibility:** `partial`
- **created:** 2026-09-25T16:36:06.853Z
- **reporter:** household

## Summary

Login is POST /auth/login not /api/auth/login. Agents guess the prefix. Need a one-page Vite proxy + createJwtAuthRouter example.

## User story

As a Vite + Express consumer I want the documented login URL and proxy table so the SPA hits the same origin.

## Proposed behavior

Docs show Vite server.proxy for /auth and /api, and the exact login path from createJwtAuthRouter.

## Proposed API

No new export; docs + jwt-auth-adapters skill example

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Add examples/vite-express or a recipe block in adapters docs
- Table: path, method, client helper

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/jwt-auth`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
