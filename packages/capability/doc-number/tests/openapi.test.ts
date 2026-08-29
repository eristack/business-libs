import { describe, expect, it } from "vitest";
import { docNumberFormatOpenApiDocument } from "../src/rest/openapi.js";

describe("doc-number OpenAPI", () => {
  it("emits format CRUD paths", () => {
    const doc = docNumberFormatOpenApiDocument("/doc-number");
    expect(Object.keys(doc.paths)).toEqual(
      expect.arrayContaining([
        "/doc-number/formats",
        "/doc-number/formats/active",
        "/doc-number/formats/:id",
        "/doc-number/preview",
      ]),
    );
  });
});
