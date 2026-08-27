# Suggestion: Sequence period keys use a specified IANA timezone for YYYY/MM

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-140917-suggestion-sequence-period-keys-use-a-specified-iana-timezo-e9e9cf`
- **kind:** suggestion
- **package:** `@eristack/doc-number`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:09:17.830Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

{YYYY} yearly reset must follow Asia/Jakarta civil year. 31 Dec 17:00 UTC is already 1 Jan in Jakarta. If next() uses UTC Date, Indonesian ERPs allocate the wrong year/period every New Year evening.

## User story

As Tiga Sekawan I want JO/2026/00001 vs JO/2027/00001 to flip at Jakarta midnight, not UTC.

## Proposed behavior

registerFormat/next accept timezone (default UTC documented). period_key for yearly is the wall year in that zone.

## Proposed API

next({ at?: Instant, timezone?: string }) or format.timezone on registerFormat

## Feasibility rationale

In-bounds for Sequence period keys use a specified IANA timezone for YYYY/MM; proceed with a concrete implementation sketch.

## Implementation sketch

- Compute period_key via timestamp wall in the given zone
- Test: instant 2026-12-31T17:00:00Z with Asia/Jakarta is 2027

## Risks

- Default timezone UTC must stay documented so existing apps do not shift periods.
- {YYYY} vs {YY} vs {MM} all need the same zone.

## Alternatives

- Call next() with a precomputed period from the app (if API allows injecting period_key — today it does not).
- Allocate numbers only during Jakarta office hours (joke, not a design).

## Agent handoff

1. Load Intent skills for `@eristack/doc-number`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

Sprint: sea-job mockup allocates JO/{YYYY}/{SEQ:5} yearly. IMPLEMENTATION §11.

### Consumer evidence (Tiga Sekawan)

IMPLEMENTATION §11: “Year is calendar year in Asia/Jakarta, not UTC (31 Dec 17:00 UTC is already 1 Jan Jakarta).”

First job of the year is the golden fixture `JO/2026/00001`. If next() uses UTC, a 31 Dec evening create in Jakarta becomes 2027 too early or 2026 too late depending on the bug.

Doc-number should accept timezone from `@eristack/timestamp` walls / instants.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
