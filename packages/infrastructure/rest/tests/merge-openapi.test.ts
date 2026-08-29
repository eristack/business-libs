import { describe, expect, it } from "vitest";
import { mergeOpenApiDocuments } from "../src/core/merge-openapi.js";
import { toOpenApiDocument } from "../src/core/openapi.js";

describe("mergeOpenApiDocuments", () => {
  it("merges paths from multiple documents", () => {
    const a = toOpenApiDocument(
      [{ method: "GET", path: "/a", handler: async () => ({ status: 200 }) }],
      { title: "A", version: "1" },
    );
    const b = toOpenApiDocument(
      [{ method: "POST", path: "/b", handler: async () => ({ status: 201 }) }],
      { title: "B", version: "1" },
    );

    const merged = mergeOpenApiDocuments(a, b);
    expect(Object.keys(merged.paths).sort()).toEqual(["/a", "/b"]);
    expect(merged.info.title).toBe("A");
  });
});
