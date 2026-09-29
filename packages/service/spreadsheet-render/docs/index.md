---
title: Overview
description: A declarative workbook model (sheets → columns → string rows) and a render-driver seam for xlsx/csv exports — CSV works out of the box, ExcelJS/SheetJS plug in behind the same interface.
---

# @eristack/spreadsheet-render

"Export to Excel" is the most requested ERP feature and the most copy-pasted one. `@eristack/spreadsheet-render` separates the two halves: the app builds a **`SpreadsheetWorkbook`** — plain data, all cells strings — and a **driver** turns it into bytes. The included stub driver produces real, RFC 4180-escaped **CSV**; for genuine `.xlsx` you wrap ExcelJS or SheetJS in a 20-line driver.

Cells are strings on purpose. Money stays `"1250.00"`, IDs keep leading zeros, dates are the wall-date you chose — nothing is silently coerced to a float on the way out.

## Use it when

- Data-grid list screens need a "Download CSV/XLSX" that respects the current filters.
- Reports (aging, stock, ledger) export with fixed columns and headers.
- Tests should assert the exact rows an export produces without opening a binary file.

## Not for

- Importing spreadsheets — parse with SheetJS in the app; this is output only.
- Formulas, styling, merged cells, charts — pass those through your own driver's ExcelJS calls; the model does not carry them.
- PDF — `@eristack/pdf-render`.

## Install

```bash
pnpm add @eristack/spreadsheet-render
pnpm add exceljs          # only if you write an xlsx driver
```

No peers.

## 30-second example

```ts
import {
  createSpreadsheetRenderer,
  createStubSpreadsheetDriver,
  workbookFromRows,
} from "@eristack/spreadsheet-render";

const workbook = workbookFromRows(
  "Invoices",
  [
    { key: "number", header: "Invoice #", width: 16 },
    { key: "customer", header: "Customer", width: 32 },
    { key: "total", header: "Total (USD)", width: 14 },
  ],
  [
    ["INV-0001", "Acme, Inc.", "1250.00"],
    ["INV-0002", 'Bolt "B" Ltd', "99.90"],
  ],
);

const csv = createSpreadsheetRenderer(createStubSpreadsheetDriver());
const { bytes, contentType } = await csv.renderWorkbook(workbook, "csv");
new TextDecoder().decode(bytes);
// Invoice #,Customer,Total (USD)
// INV-0001,"Acme, Inc.",1250.00
// INV-0002,"Bolt ""B"" Ltd",99.90
```

## API

| Export | Signature | Notes |
| --- | --- | --- |
| `workbookFromRows` | `(sheetName, columns: SpreadsheetColumn[], rows: string[][]) => SpreadsheetWorkbook` | Positional rows → keyed records by column order. Missing cells → `""`. One sheet. |
| `createSpreadsheetRenderer` | `(driver) => { renderWorkbook(workbook, format): Promise<SpreadsheetRenderOutput> }` | Delegate; services depend on this, not the driver. |
| `createStubSpreadsheetDriver` | `() => SpreadsheetRenderDriver` | `"csv"` → **real CSV** of the first sheet (quotes cells containing `" , \n \r`, doubles quotes, `\n` line endings, `text/csv; charset=utf-8`). `"xlsx"` → marker bytes `PK-stub-xlsx:<sheetCount>` — not a valid file. |
| `SpreadsheetWorkbook` | `{ sheets: SpreadsheetSheet[] }` | Build by hand for multi-sheet. |
| `SpreadsheetSheet` | `{ name: string; columns: SpreadsheetColumn[]; rows: Record<string, string>[] }` | |
| `SpreadsheetColumn` | `{ key: string; header: string; width?: number }` | `width` in characters — advisory for xlsx drivers. |
| `SpreadsheetFormat` | `"xlsx" \| "csv"` | |
| `SpreadsheetRenderOutput` | `{ bytes: Uint8Array; contentType: string }` | |
| `SpreadsheetRenderDriver` | `{ renderWorkbook(workbook, format): Promise<SpreadsheetRenderOutput> }` | Implement for ExcelJS/SheetJS. |

## Works with

- `@eristack/data-grid` — run the same `DataGridQuery` the screen uses with a large page size, map items to rows, export. Filters and sorts match what the user sees.
- `@eristack/money` — `amount.amountString()` into cells; `formatMoney` only if the export is for humans not re-import.
- `@eristack/file-manager` + `@eristack/checksum` — store large exports, hand out presigned URLs, keep a digest.
- `@eristack/outbox` — exports over a few thousand rows belong in a worker.
- `@eristack/pdf-render` — same driver pattern.

## For agents

- Skill: `pnpm dlx @tanstack/intent@latest load @eristack/spreadsheet-render#spreadsheet-render-core`
- Recipe: `spreadsheet-export-download`.

## Next

- [Getting started](./getting-started.md) — ExcelJS driver, data-grid export route, multi-sheet workbooks, streaming large exports.
