import { describe, expect, it } from "vitest";
import { seedDocNumberMemoryFormats } from "../src/backseat/seed-formats.js";

describe("seedDocNumberMemoryFormats", () => {
  it("registers demo formats without consuming sequences", async () => {
    const docNumber = await seedDocNumberMemoryFormats();
    const formats = await docNumber.listFormats("invoice");
    expect(formats.items.length).toBeGreaterThan(0);
    expect(docNumber.preview({ pattern: "INV-{YYYY}-{SEQ:5}", sequence: 1 })).toMatch(
      /^INV-/,
    );
  });
});
