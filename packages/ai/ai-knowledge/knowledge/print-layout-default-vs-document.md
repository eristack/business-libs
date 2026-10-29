# Print layout: company default vs frozen document mask

**Canonical pattern** for AR/AP print settings in document-with-lines apps. Not a package — app-owned tables and field names.

Load with `@eristack/ai-knowledge#document-lines-erp` when wiring invoices or print routes.

---

## Problem

Company print settings change (locale, which tax lines print, which shipment fields show). A posted invoice should not silently change layout when an admin updates the company default. Drafts usually follow the **live** default until the document saves its own mask.

---

## Data model (app-owned)

| Store | Typical shape | Meaning |
| --- | --- | --- |
| Company singleton | `ar_print_settings` (one row) | Default locale, enabled tax codes, boolean field mask for shipment/invoice blocks |
| Document column | `invoices.print_shipment_fields` JSON nullable | `null` → resolve mask from company default at print time; non-null object → **frozen** mask for that invoice |

Field names (`showPol`, `showVessel`, …) stay in the app. Libraries do not ship invoice layouts.

---

## Resolve at print time

```ts
type PrintFieldMask = Record<string, boolean>;

function resolvePrintMask(args: {
  companyDefault: PrintFieldMask;
  documentMask: PrintFieldMask | null;
}): PrintFieldMask {
  return args.documentMask ?? args.companyDefault;
}
```

Tax codes and locale follow the same rule: company default for new documents; snapshot on issue/post if the product requires immutable print metadata.

---

## HTTP (typical)

- `GET/PATCH /settings/ar-print` — company default (masters screen).
- `GET/PATCH /invoices/:id/print-settings` — document override; PATCH may bump `expectedVersion` like any other document slice (`@eristack/backseat/client` `patchDocumentWithExpectedVersion`).

Print PDF/HTML worker reads resolved mask + line data; do not re-fetch company default alone for a document that already frozen a mask.

---

## Checklist

1. Nullable document mask means “follow company default” — not an empty object unless empty is intentional.
2. Saving a mask on a draft freezes that invoice; changing company default does not rewrite frozen rows.
3. Use `@eristack/tax` catalog helpers for which tax codes appear on print totals.
4. Money display uses `formatMoney` + app locale string (`A2` — no second formatter package).

---

## Related

- [document-lines-erp](./document-lines-erp.md) — invoice/cost-sheet spine
- [optimistic-document-version](./optimistic-document-version.md) — PATCH print-settings with `expectedVersion`
