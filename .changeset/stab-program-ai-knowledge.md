---
"@eristack/ai-knowledge": patch
---

Stabilization batch (release with train, not per iteration): recommend skill trim, cross-cutting skills single-source.

- `recommend()` scores each goal by its best matching trigger, so plain "login" routes to `jwt-auth-sessions` instead of OAuth; match quality now outweighs recipe priority.
- Fixed guide examples: tax/rounding/business-calendar methods live on `createTaxRegistry()` / `createRoundingPolicyRegistry()` / `createBusinessCalendar()`, `assertPeriodOpen(period)` takes one argument, valuations use `createValuationEngine`.
- Removed references to unpublished packages and replaced recipe ids written as skill anchors with loadable skills.
- Skills now tell agents to install matched `@eristack/*` packages rather than re-implement them.
