export type SpreadsheetColumn = {
  key: string;
  header: string;
  width?: number;
};

export type SpreadsheetSheet = {
  name: string;
  columns: SpreadsheetColumn[];
  rows: Record<string, string>[];
};

export type SpreadsheetWorkbook = {
  sheets: SpreadsheetSheet[];
};

export type SpreadsheetFormat = "xlsx" | "csv";

export type SpreadsheetRenderOutput = {
  bytes: Uint8Array;
  contentType: string;
};

export interface SpreadsheetRenderDriver {
  renderWorkbook(
    workbook: SpreadsheetWorkbook,
    format: SpreadsheetFormat,
  ): Promise<SpreadsheetRenderOutput>;
}
