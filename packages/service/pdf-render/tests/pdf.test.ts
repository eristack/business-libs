import { describe, expect, it } from "vitest";

import { createPdfRenderer, createStubPdfDriver } from "../src/index.js";

describe("pdf-render", () => {
  it("stub driver returns pdf content type", async () => {
    const renderer = createPdfRenderer(createStubPdfDriver());
    const out = await renderer.render({ html: "<p>Hi</p>", title: "inv" });
    expect(out.contentType).toBe("application/pdf");
    expect(out.bytes.length).toBeGreaterThan(0);
  });
});
