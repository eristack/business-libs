---
title: Tiga Sekawan 3ss adoption
description: Consumer checklist mapping 3ss platform seam rows to @eristack packages and Tiga Sekawan file paths after business-libs ships the library work.
---

# Tiga Sekawan — adopt 3ss platform seams (consumer)

Library work for batch **`3ss`** lives in **business-libs**. This guide is the **consumer checklist** for Tiga Sekawan (or any document-with-lines app) after packages publish. App-owned: parties, jobs, charges, print field names, error wording.

Load `@eristack/ai-knowledge#document-lines-erp` first.

## Library program (business-libs) — complete

All rows **A1–B11** and **B3** (step 1 + 2) shipped in `@eristack/*` with changesets under `.changeset/3ss-*.md`. **B4** manifest contract shipped (`defineErpCollection`, `backseatCollectionsFromManifests`); SQL/codegen from manifests is **deferred**. **A6** is `resolveQuotePerBaseForWallDate` on `@eristack/money` (no `@eristack/fx-rate` package). Reference: `examples/express` (`openDrizzle`, `collections.ts`), ticket `tickets/20261014-203500-suggestion-consumer-platform-seams-tiga-sekawan.md` § Library status.

**Remaining work is consumer-only** (Tiga Sekawan app repo) unless you pick up B4 codegen in a future library iteration.

## Row → library mapping

| Row | Consumer touch | Package / skill |
| --- | --- | --- |
| A1 tax catalog | Replace app `APP_TAX_CODES`-only path with `buildTaxCatalog` / `resolveTaxRateFromCatalog` | `@eristack/tax` |
| A2 empty totals | `Money.sum([], currency)`; print tax via money, not `Math.round(Number())` | `@eristack/money` |
| A3 replace create tab | `replaceTab` after successful create; set `closeGuard` on dirty drafts | `@eristack/multitab` |
| A4 spreadsheet select | Pointer commit on charge/tax selects | `@eristack/spreadsheet-operator` |
| A5 doc heading | `DocDetailHeading` slots on invoice detail | `@eristack/doc-shell` |
| A6 FX period | `resolveQuotePerBaseForWallDate` + `convertAtQuotePerBase` | `@eristack/money` |
| A7 print layout | Company singleton + nullable per-invoice mask — `#print-layout-default` | ai-knowledge recipe |
| B1 busy | `createBusy` / `BusyProvider` — keep sky bar + lock UI in app | `@eristack/feedback` |
| B2 errors | `createErrorCatalog` + mapHandlerError; toast reads catalog sentence | `@eristack/backseat/express` + `#http-errors` |
| B3 database | `openDrizzle` + `createEristackSpineTables` / column helpers | `@eristack/drizzle` |
| B4 collections | `defineErpCollection` manifests → Backseat + row mappers — see `#collection-declaration-horizon-b` | `@eristack/drizzle/schema` |
| B5 feedback sequence | `runFeedbackSequence` after confirm | `@eristack/feedback` |
| B6 save client | `patchDocumentWithExpectedVersion` / `#optimistic-document-version` | `@eristack/backseat/client` |
| B7 wall dates | `readWallDateField` / `formatPostedAt` | `@eristack/timestamp/react` |
| B8 picker | `pickerMasters(rows, currentId)` on tax/bank/charge lists | `@eristack/master-detail` |
| B9 epoch | `useEpochInvalidation(scope, key, { exact: true })` on detail queries | `@eristack/epoch/react` |
| B10 refresh | `createRefreshCoordinator` on jwt-auth client | `@eristack/jwt-auth/client` |
| B11 typeahead | `SearchableSelect` for party/job/bank pickers | `@eristack/form-ui` |

## Suggested migration order

1. **Feedback + errors** (B1/B2/B5) — every screen.
2. **Auth refresh + epoch + save client** (B10/B9/B6) — stops silent data loss.
3. **Tax, money, wall dates, pickers** (A1/A2/A6/B7/B8/B11).
4. **Doc chrome + print recipe** (A5/A7).
5. **Drizzle boot + spine** (B3) — replace `createAppDatabase` copy-paste.
6. **Collection manifests + mirror CI** (B4) — `#collection-declaration-horizon-b`.

## Files in Tiga Sekawan (starting points)

| Area | Path |
| --- | --- |
| Busy / confirm | `apps/web/src/lib/feedback/` |
| Errors | `packages/workshop/src/core/http.ts`, `apps/web/src/lib/feedback/toast.ts` |
| DB boot | `packages/db/src/client.ts`, `schema/erp.ts` |
| Auth | `apps/web/src/lib/auth-client.ts` |
| Epoch | `apps/web/src/data/epoch/use-epoch-invalidation.ts` |
| Invoice chrome | `apps/web/src/features/invoices/invoice-detail-page.tsx` |
| Searchable select | `apps/web/src/components/ui/searchable-select.tsx` → form-ui |

## Do not

- Move job/invoice/partner types into Eristack.
- Add `@eristack/feature-*` packages for this adoption pass.
