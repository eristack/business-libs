import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { FormField, MoneyInput } from "../src/index.js";

describe("form-ui", () => {
  it("renders MoneyInput with amount and currency", () => {
    const html = renderToStaticMarkup(
      <FormField label="Unit price">
        <MoneyInput amount="10.00" currency="USD" name="unitPrice" />
      </FormField>,
    );
    expect(html).toContain("Unit price");
    expect(html).toContain('data-currency="USD"');
    expect(html).toContain('value="10.00"');
  });
});
