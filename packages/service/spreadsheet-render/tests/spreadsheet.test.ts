import { describe, expect, it } from "vitest";

import {
  createSpreadsheetRenderer,
  createStubSpreadsheetDriver,
  workbookFromRows,
} from "../src/index.js";

describe("spreadsheet-render", () => {
  it("stub csv export", async () => {
    const wb = workbookFromRows(
      "Sheet1",
      [{ key: "id", header: "ID" }],
      [["1"]],
    );
    const renderer = createSpreadsheetRenderer(createStubSpreadsheetDriver());
    const out = await renderer.renderWorkbook(wb, "csv");
    const text = new TextDecoder().decode(out.bytes);
    expect(text).toContain("ID");
    expect(text).toContain("1");
  });
});
