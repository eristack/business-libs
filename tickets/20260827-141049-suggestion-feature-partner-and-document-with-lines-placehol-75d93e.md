# Suggestion: feature-partner and document-with-lines placeholders in recommend() for logistics ERPs

> Portable Eristack ticket — send this file to the maintainer. Feasibility is a first-pass gate for agents.

## Meta

- **id:** `20260827-141049-suggestion-feature-partner-and-document-with-lines-placehol-75d93e`
- **kind:** suggestion
- **package:** `@eristack/ai-knowledge`
- **feasibility:** `possible`
- **created:** 2026-08-27T14:10:49.980Z
- **reporter:** Tiga Sekawan ERP (consumer)

## Summary

recommend() erp-modules still pulls stock-movement, valuations, financial-ledger. Tiga Sekawan is job+charges+partners, not warehouse. feature-partner / feature-product are 'coming soon'. Until they ship, recommend() should say app-owned partners AND not score GL/stock for cost-sheet ERPs. A document-with-lines recipe (header + QUPS lines + doc-number + pbac) is the actual spine.

## User story

As a forwarding ERP I want recommend(jobs, cost sheet, invoices) to hit qups+money+doc-number+pbac+data-grid+backseat, not FIFO valuation.

## Proposed behavior

New recipe document-lines-erp. Lower score of stock/GL unless inventory/accounting goals present. Document app-owned Partner {isCustomer,isVendor}.

## Proposed API

recommend() goals: job, shipment, cost sheet, partner master

## Feasibility rationale

In-bounds for feature-partner and document-with-lines placeholders in recommend() for logistics ERPs; proceed with a concrete implementation sketch.

## Implementation sketch

- Recipe YAML + catalog triggers: job order, cost sheet, forwarding, freight
- Keep feature-partner as coming soon note, do not invent a fake @eristack/feature-partner package

## Risks

- Do not publish a fake @eristack/feature-partner npm package from this ticket.
- Do not drop qups from erp-modules.

## Alternatives

- Consumer IMPLEMENTATION already says app-owned partners. Still want recommend() to stop scoring FIFO for a cost-sheet ERP.

## Agent handoff

1. Load Intent skills for `@eristack/ai-knowledge`.
2. Implement the sketch; prefer additive APIs.
3. Update package docs + skills if the public surface changes.
4. Run `pnpm knowledge:sync` when skills/exports change.
5. Add a Changeset for user-facing changes.

## Notes

recommend() catalog 2026-08-22. IMPLEMENTATION §5 do not pull stock/valuations/financial-ledger for v1.

### Consumer evidence (Tiga Sekawan)

Product goals in recommendations.md: erp, login, invoices, document numbers, roles, inventory, general ledger, multitab, backseat, epoch, posted at, transaction date.

Inventory/GL were scaffold leftovers. Real product: Job, CostSheet lines (QUPS), Partner is_customer/is_vendor, Invoice commercial (no GL).

A `document-lines-erp` recipe (header document + QUPS lines + doc-number + pbac + data-grid + jwt-auth + backseat) matches Job/CostSheet/Invoice. Partner stays app-owned until feature-partner exists.

Triggers to add: job order, cost sheet, forwarding, freight, shipment, bill of lading (docs only).

### Sibling tickets (2026-08-27 batch)

See `.eristack/tickets/20260827-index-tiga-sekawan-horizon-a-eristack-gaps.md`.
