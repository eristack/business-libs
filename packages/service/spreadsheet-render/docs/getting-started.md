---
title: Getting started
description: Export a data-grid list to CSV/XLSX from Express, write an ExcelJS driver behind the renderer seam, build multi-sheet workbooks, and move big exports to a worker.
---

# Getting started

## Install

```bash
pnpm add @eristack/spreadsheet-render @eristack/data-grid
pnpm add exceljs      # for real .xlsx
```

## Export what the user is looking at

The list screen already sends a `DataGridQuery` (filters, sorts). Reuse it:

```ts
import { workbookFromRows } from "@eristack/spreadsheet-render";
import { fromSearch } from "@eristack/data-grid";
import { spreadsheet } from "./spreadsheet.js";   // renderer, see below

const COLUMNS = [
  { key: "number", header: "Invoice #", width: 16 },
  { key: "customer", header: "Customer", width: 32 },
  { key: "date", header: "Date", width: 12 },
  { key: "total", header: "Total", width: 14 },
  { key: "currency", header: "Ccy", width: 6 },
];

app.get("/invoices/export", requireAuth, async (req, res) => {
  const format = req.query.format === "xlsx" ? "xlsx" : "csv";
  const query = fromSearch(req.query, invoiceGridSchema);            // same filters/sorts as the screen
  const { items } = await listInvoices({ ...query, pageSize: 10_000 }); // your executeDrizzleList wrapper

  const workbook = workbookFromRows(
    "Invoices",
    COLUMNS,
    items.map((i) => [i.number, i.customerName, i.documentDate, i.total.amount, i.total.currency]), // all strings
  );

  const { bytes, contentType } = await spreadsheet.renderWorkbook(workbook, format);
  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="invoices.${format}"`);
  res.send(Buffer.from(bytes));
});
```

`i.total.amount` is the Money JSON string (`"1250.00"`) — never `Number(...)` it for a spreadsheet; Excel will happily show `1250` and drop the cents' significance, and CSV re-imports lose the type.

## ExcelJS driver (real xlsx, CSV delegated to the stub)

```ts
// spreadsheet.ts
import ExcelJS from "exceljs";
import {
  createSpreadsheetRenderer,
  createStubSpreadsheetDriver,
  type SpreadsheetRenderDriver,
} from "@eristack/spreadsheet-render";

const csv = createStubSpreadsheetDriver();

const excelDriver: SpreadsheetRenderDriver = {
  async renderWorkbook(workbook, format) {
    if (format === "csv") return csv.renderWorkbook(workbook, "csv");   // stub CSV is production-grade

    const wb = new ExcelJS.Workbook();
    for (const sheet of workbook.sheets) {
      const ws = wb.addWorksheet(sheet.name);
      ws.columns = sheet.columns.map((c) => ({ key: c.key, header: c.header, width: c.width ?? 14 }));
      ws.getRow(1).font = { bold: true };
      for (const row of sheet.rows) ws.addRow(row);                   // keyed by column.key
      ws.views = [{ state: "frozen", ySplit: 1 }];
    }
    const buffer = await wb.xlsx.writeBuffer();
    return {
      bytes: new Uint8Array(buffer),
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  },
};

export const spreadsheet = createSpreadsheetRenderer(
  process.env.NODE_ENV === "test" ? csv : excelDriver,
);
```

Cells arrive as strings; ExcelJS stores them as text, which is what you want for IDs and amounts. If finance insists on numeric cells for sums, convert **in the driver** for specific columns (`ws.getColumn("total").numFmt = "#,##0.00"` + `Number(row.total)`) — the model stays string-first.

## Multi-sheet workbooks

`workbookFromRows` builds one sheet. For several, assemble the object directly:

```ts
import type { SpreadsheetWorkbook } from "@eristack/spreadsheet-render";

const workbook: SpreadsheetWorkbook = {
  sheets: [
    workbookFromRows("Summary", SUMMARY_COLS, summaryRows).sheets[0],
    workbookFromRows("Lines", LINE_COLS, lineRows).sheets[0],
  ],
};
```

CSV renders **only the first sheet** — put the one users expect first, or offer per-sheet CSV downloads.

## Large exports

Anything past ~20k rows: enqueue with `@eristack/outbox`, render in a worker, upload with `@eristack/file-manager`, record `sha256Hex(bytes)` (`@eristack/checksum`), and notify via `@eristack/comms` with a presigned link. The request returns `202 { jobId }`. Same renderer, different caller.

## Gotchas

- Stub `"xlsx"` is a marker, not a file. If `spreadsheet.renderWorkbook(wb, "xlsx")` returns 20 bytes in production, you wired the stub.
- CSV uses `\n` line endings and no BOM. Excel on Windows may mis-detect UTF-8 — prepend `\uFEFF` in your route if your users hit that.
- Header row = `column.header`; cell lookup = `row[column.key]`. A typo in `key` yields a silent empty column.
- `width` is advisory; the CSV driver ignores it.
- Formatting locale-specific numbers (`1.250,00`) makes CSV un-reimportable. Export raw strings; let the spreadsheet app format.

## Testing

```ts
import { createSpreadsheetRenderer, createStubSpreadsheetDriver, workbookFromRows } from "@eristack/spreadsheet-render";
import { expect, it } from "vitest";

it("escapes CSV per RFC 4180", async () => {
  const r = createSpreadsheetRenderer(createStubSpreadsheetDriver());
  const wb = workbookFromRows("S", [{ key: "a", header: "A" }, { key: "b", header: "B" }], [['x,"y"', "line\nbreak"]]);
  const out = await r.renderWorkbook(wb, "csv");
  expect(new TextDecoder().decode(out.bytes)).toBe('A,B\n"x,""y""","line\nbreak"');
});
```
