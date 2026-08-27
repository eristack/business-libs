# Suggestion: Standard error envelope helper matching Express 400/403/409 mapping

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141049-suggestion-standard-error-envelope-helper-matching-express--d5663d`
- **kind:** suggestion
- **package:** `@eristack/backseat`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:10:49.533Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

Every Tiga Sekawan Backseat handler copies { error: { code, message } }. Horizon B mapDomainError must match. A small backseat.httpError(status, code, message, details?) plus docs aligning with createRequireBusinessPolicy 409 would keep mockup and API identical.

## User story

As a handler author I want one error shape so the web client parses Backseat and Express the same way.

## Proposed behavior

Helper returns { status, body: { error: { code, message, details? } } }. Recommend codes UNAUTHENTICATED FORBIDDEN NOT_FOUND CONFLICT_VERSION POLICY_DENIED VALIDATION_*

## Proposed API

jsonError({ status, code, message, details? })

## Feasibility rationale

In-bounds for Standard error envelope helper matching Express 400/403/409 mapping; proceed with a concrete implementation sketch.

## Implementation sketch

- Pure helper in backseat core or rest codec if one exists
- jwt-auth/pbac express adapters mention the same envelope

## Risks

- Do not force all @eristack express routers to change overnight; additive helper.
- Codes list is a convention, not a closed enum in core (apps add JOB_ILLEGAL_TRANSITION).

## Alternatives

- Copy-paste { error: { code, message } } in every handler (current PO Backseat).

## Agent handoff

1. Load Intent skills for `@eristack/backseat`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

IMPLEMENTATION §12.1 error envelope + HTTP table. PO handlers already use this shape.

### Consumer evidence (Tiga Sekawan)

IMPLEMENTATION error envelope:

```json
{ "error": { "code": "COST_SHEET_LOCKED", "message": "...", "details": {} } }
```

HTTP: 400 VALIDATION_*, 401, 403 FORBIDDEN_PERMISSION/FORBIDDEN_SCOPE, 409 PBAC/CONFLICT_VERSION, 404 NOT_FOUND.

Backseat PO uses `{ error: { code: "FORBIDDEN", message } }` and POLICY_DENIED. A helper `jsonError` plus the same shape from pbac/express 409 would make Horizon B mapDomainError trivial.

Web `backseatHandle` currently throws on message string only — aligning status+code would improve UI error states.

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
