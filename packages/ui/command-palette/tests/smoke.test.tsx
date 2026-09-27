import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CommandPaletteDialog, useCommandPalette } from "../src/index.js";

describe("command-palette", () => {
  it("renders dialog when open", () => {
    const html = renderToStaticMarkup(
      <CommandPaletteDialog open title="Go to">
        <button type="button">Partners</button>
      </CommandPaletteDialog>,
    );
    expect(html).toContain('data-component="command-palette-dialog"');
    expect(html).toContain("Partners");
  });

  it("exports useCommandPalette hook", () => {
    expect(typeof useCommandPalette).toBe("function");
  });
});
