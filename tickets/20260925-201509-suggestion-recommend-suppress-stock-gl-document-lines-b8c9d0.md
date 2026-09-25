# Suggestion: recommend() suppress stock/GL for document-lines-erp product id

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260925-201509-suggestion-recommend-suppress-stock-gl-document-lines-b8c9d0`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `possible`
- **created:** 2026-09-25T20:15:09.000Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

`pnpm recommend` can still rank stock-movement and financial-ledger for forwarding ERP repos if goals are generic. Recipe `document-lines-erp` and `backseat-then-backend` exist but agents may load wrong spine. Add explicit **product profile** that suppresses inventory/GL packages unless requested.

## User story

As a document-with-lines ERP I want `recommend({ product: 'document-lines-erp' })` to never suggest valuations/stock/GL by default.

## Proposed behavior

- `recommend()` accepts optional `product` or reads `eristack.product` from package.json / config.
- `loadPlan()` output includes “anti-packages” section for document-lines.
- Catalog triggers already improved—enforce in scoring.

## Proposed API

```ts
recommend({ goals, product?: 'document-lines-erp' | 'erp-modules' | ... })
```

## Feasibility rationale

Scoring/config change in ai-knowledge; no runtime ERP code.

## Implementation sketch

- Update `recommendations.md` generator.
- Test fixture: forwarding goals → top plans exclude stock-movement.

## Risks

- Apps that genuinely need stock must opt in explicitly.

## Alternatives

- Consumer `.cursor/rules` only — already done; upstream should match.

## Agent handoff

1. ai-knowledge + recommend() tests.
2. Document in stack-defaults skill.

## Notes

Related: `20260827-141049-suggestion-feature-partner-and-document-with-lines-placehol-75d93e.md`, index §6.

### Sibling tickets

`20260925-index-tiga-sekawan-horizon-b-eristack-gaps.md`.
