import { describe, expect, it } from "vitest";
import { registerFormatBodySchema } from "../src/zod/index.js";

describe("doc-number zod", () => {
  it("parses register format body", () => {
    const parsed = registerFormatBodySchema.parse({
      entityKey: "invoice",
      pattern: "INV-{YYYY}-{SEQ:5}",
      reset: "yearly",
    });
    expect(parsed.entityKey).toBe("invoice");
  });
});
