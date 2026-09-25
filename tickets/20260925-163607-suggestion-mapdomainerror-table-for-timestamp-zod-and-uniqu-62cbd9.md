# Suggestion: mapDomainError table for timestamp Zod and unique violations

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-163607-suggestion-mapdomainerror-table-for-timestamp-zod-and-uniqu-62cbd9`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `possible`
- **created:** 2026-09-25T16:36:07.225Z
- **reporter:** household

## Summary

Temporal, Zod, and unique-violation all became BUSINESS_POLICY_DENIED or VALIDATION_ERROR in a consumer journal API. http-errors skill needs a copy-paste mapDomainError table.

## User story

As an Express consumer I want TimestampParseError → 400 INVALID_TIMESTAMP and unique → 409 CONFLICT without inventing the envelope.

## Proposed behavior

http-errors recipe lists TimestampParseError, Zod issues, unique 23505, CONFLICT_VERSION, POLICY_DENIED with status and code.

## Proposed API

Docs/recipe only unless a tiny mapDomainError helper lands in rest or a shared errors module

## Feasibility rationale

In-bounds for mapDomainError table for timestamp Zod and unique violations; proceed with a concrete implementation sketch.

## Implementation sketch

- Extend knowledge/http-errors.md with the table
- Example Express error middleware

## Risks

_None yet._

## Alternatives

_None yet._

## Agent handoff

1. Load Intent skills for `@eristack/ai-knowledge`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

_None yet._
