import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SearchableSelect } from "../src/searchable-select.js";

describe("SearchableSelect", () => {
  it("renders combobox input", () => {
    const html = renderToStaticMarkup(
      <SearchableSelect
        value="a"
        onValueChange={() => undefined}
        options={[
          { value: "a", label: "Alpha", searchText: "first" },
          { value: "b", label: "Beta" },
        ]}
      />,
    );
    expect(html).toContain('role="combobox"');
    expect(html).toContain('data-component="searchable-select"');
  });
});
