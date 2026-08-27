# Suggestion: Scoped sequences (branch or location) without a second FormatStore

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141049-suggestion-scoped-sequences-branch-or-location-without-a-se-d17d40`
- **kind:** suggestion
- **package:** `@eristack/doc-number`
- **feasibility:** `partial`
- **created:** 2026-08-27T14:10:49.228Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Tiga Sekawan may need JO numbers per branch. Today the workaround is entity_key per branch or prefix hacks. A scope key on next({ scope: branchId }) that participates in period_key uniqueness would match cabang_id numbering without N formats.

## User story

As a multi-branch forwarder I want JO/SUB/2026/00001 and JO/JKT/2026/00001 independent sequences.

## Proposed behavior

Optional scope string on next/peekNext. Sequence unique on (format_id, period_key, scope). Pattern token {SCOPE} optional.

## Proposed API

next({ entityKey, at, scope?: string })

## Feasibility rationale

Likely doable as an additive / adapter-scoped change.

## Implementation sketch

- Extend SequenceStore identity; default scope '' for current behavior
- Docs: do not encode branch in entityKey unless format itself differs

## Risks

- Empty scope must equal today’s uniqueness (format_id, period_key) or migrations break.
- {SCOPE} token sanitization (no slashes).

## Alternatives

- entity_key `job-SUB` vs `job-JKT` — N formats, N admin UIs.
- IMPLEMENTATION default is company-wide yearly seq until the client asks.

## Agent handoff

1. Load Intent skills for `@eristack/doc-number`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

IMPLEMENTATION §11 per-branch sequences. Not blocking Horizon A (company-wide JO/{YYYY}/{SEQ:5}). Needed if Q8 changes.

### Consumer evidence (Tiga Sekawan)

Sample Software Location/cabang_id is everywhere. We default to company-wide numbers so Horizon A ships. If Tiga Sekawan wants per-branch JO numbers, we should not clone formats.

Optional scope on next() keeps one format row.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
