import type {
  SpreadsheetFormat,
  SpreadsheetRenderDriver,
  SpreadsheetWorkbook,
} from "./types.js";

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function workbookToCsv(workbook: SpreadsheetWorkbook): string {
  const sheet = workbook.sheets[0];
  if (!sheet) return "";
  const header = sheet.columns.map((c) => escapeCsvCell(c.header)).join(",");
  const body = sheet.rows.map((row) =>
    sheet.columns.map((c) => escapeCsvCell(row[c.key] ?? "")).join(","),
  );
  return [header, ...body].join("\n");
}

export function createSpreadsheetRenderer(driver: SpreadsheetRenderDriver) {
  return {
    renderWorkbook(workbook: SpreadsheetWorkbook, format: SpreadsheetFormat) {
      return driver.renderWorkbook(workbook, format);
    },
  };
}

export function createStubSpreadsheetDriver(): SpreadsheetRenderDriver {
  return {
    async renderWorkbook(workbook, format) {
      if (format === "csv") {
        const text = workbookToCsv(workbook);
        return {
          bytes: new TextEncoder().encode(text),
          contentType: "text/csv; charset=utf-8",
        };
      }
      const marker = `PK-stub-xlsx:${workbook.sheets.length}`;
      return {
        bytes: new TextEncoder().encode(marker),
        contentType:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      };
    },
  };
}
