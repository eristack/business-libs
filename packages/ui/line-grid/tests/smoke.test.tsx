import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { calculateLine, patchLine } from "@eristack/qups";
import { LineGrid } from "../src/line-grid.js";

describe("line-grid", () => {
  it("patchLine recalculates subtotal", () => {
    const line = calculateLine({
      truth: "quantity+unitPrice",
      currency: "USD",
      quantity: "2",
      unitPrice: "50",
    });
    const next = patchLine(line, { quantity: "3" });
    expect(next.subtotal).toBe("150");
  });

  it("renders LineGrid table", () => {
    const line = calculateLine({
      truth: "quantity+unitPrice",
      currency: "USD",
      quantity: "1",
      unitPrice: "10",
    });
    const html = renderToStaticMarkup(
      <LineGrid
        line={line}
        columns={[{ id: "qty", header: "Qty" }]}
        renderCell={(id) => (id === "qty" ? line.quantity : null)}
      />,
    );
    expect(html).toContain('data-component="line-grid"');
    expect(html).toContain("Qty");
  });
});
