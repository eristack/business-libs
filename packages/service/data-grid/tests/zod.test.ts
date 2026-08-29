import { describe, expect, it } from "vitest";
import { dataGridSearchParamsSchema } from "../src/zod/index.js";

describe("data-grid zod", () => {
  it("coerces page numbers from strings", () => {
    const parsed = dataGridSearchParamsSchema.parse({
      mode: "search",
      q: "acme",
      page: "2",
      pageSize: "25",
    });
    expect(parsed.page).toBe(2);
    expect(parsed.pageSize).toBe(25);
  });
});
