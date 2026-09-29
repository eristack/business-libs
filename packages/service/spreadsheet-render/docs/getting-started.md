---
title: Getting started
description: Map @eristack/data-grid list rows to string cells in the app before render. Optional @eristack/checksum on download bytes. Recipe spreadsheet-export-download.
---

# Getting started

```bash
pnpm add @eristack/spreadsheet-render
```

```ts
import {
  createSpreadsheetRenderer,
  createStubSpreadsheetDriver,
  workbookFromRows,
} from "@eristack/spreadsheet-render";

const wb = workbookFromRows(
  "Orders",
  [{ key: "id", header: "Order ID" }],
  [["ORD-1"]],
);
const renderer = createSpreadsheetRenderer(createStubSpreadsheetDriver());
const csv = await renderer.renderWorkbook(wb, "csv");
```

## Collaboration

Map `@eristack/data-grid` list rows to **string cells** in the app before render. Optional `@eristack/checksum` on download bytes. Recipe **`spreadsheet-export-download`**.
