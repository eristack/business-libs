import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FilterSheet } from "../src/index.js";

describe("filter-builder", () => {
  it("renders open filter sheet", () => {
    const html = renderToStaticMarkup(
      <FilterSheet open title="Advanced">
        <span>Field</span>
      </FilterSheet>,
    );
    expect(html).toContain("Advanced");
    expect(html).toContain('data-component="filter-sheet"');
  });
});
