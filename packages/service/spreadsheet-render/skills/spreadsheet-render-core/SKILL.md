---
name: spreadsheet-render-core
description: >
  @eristack/spreadsheet-render workbookFromRows(sheet, columns, string[][]) → SpreadsheetWorkbook;
  createSpreadsheetRenderer(driver).renderWorkbook(wb, "csv" | "xlsx") → { bytes, contentType }.
  Stub driver emits real RFC 4180 CSV (xlsx is a marker); wrap ExcelJS/SheetJS behind the same
  SpreadsheetRenderDriver for .xlsx. Use for data-grid "Export" and report downloads; cells stay
  strings (money amounts, IDs). Output only — not import, not PDF.
metadata:
  author: eristack
  version: "0.1"
  type: core
  library: "@eristack/spreadsheet-render"
sources:
  - packages/service/spreadsheet-render/docs/getting-started.md
---

# @eristack/spreadsheet-render

Declarative string-cell workbook + driver seam. CSV is ready; xlsx is a 20-line ExcelJS driver in the app.

```ts
import { workbookFromRows, createSpreadsheetRenderer, createStubSpreadsheetDriver } from "@eristack/spreadsheet-render";

const wb = workbookFromRows("Invoices",
  [{ key: "number", header: "Invoice #", width: 16 }, { key: "total", header: "Total", width: 14 }],
  items.map((i) => [i.number, i.total.amount]));              // all cells strings
const r = createSpreadsheetRenderer(createStubSpreadsheetDriver());
const { bytes, contentType } = await r.renderWorkbook(wb, "csv");   // text/csv; first sheet only
```

## Checklist

1. Export route reuses the screen's `@eristack/data-grid` query with a large `pageSize`; map items → `string[][]`.
2. Money cells = `money.amount` / `amountString()` — never `Number()`; IDs keep leading zeros.
3. Driver module: `format === "csv"` → stub; `"xlsx"` → ExcelJS (`ws.columns` from `SpreadsheetColumn`, `addRow(record)`), export one `spreadsheet` renderer.
4. `Content-Disposition: attachment; filename="x.csv|xlsx"`; consider `\uFEFF` BOM for Windows Excel.
5. > ~20k rows → `@eristack/outbox` worker → `@eristack/file-manager` upload + `@eristack/checksum` → presigned link.

## Do not

- Ship stub `"xlsx"` output (`PK-stub-xlsx:` marker, not a file).
- Expect multi-sheet CSV, formulas, styles, or merged cells in the model — driver concerns.
- Parse spreadsheets here — SheetJS in app.
