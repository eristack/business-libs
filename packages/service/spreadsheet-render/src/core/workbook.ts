import type { SpreadsheetColumn, SpreadsheetSheet, SpreadsheetWorkbook } from "./types.js";

export function workbookFromRows(
  sheetName: string,
  columns: SpreadsheetColumn[],
  rows: string[][],
): SpreadsheetWorkbook {
  const sheetRows = rows.map((cells) => {
    const record: Record<string, string> = {};
    columns.forEach((col, index) => {
      record[col.key] = cells[index] ?? "";
    });
    return record;
  });
  const sheet: SpreadsheetSheet = { name: sheetName, columns, rows: sheetRows };
  return { sheets: [sheet] };
}
