import { describe, expect, it } from "vitest";
import {
  documentPreview,
  parseDocumentJson,
  parseSnapshotJson,
} from "../src/react/devtools-api.js";

describe("devtools-api", () => {
  it("parses insert document JSON", () => {
    expect(parseDocumentJson('{"id":"p1","name":"Desk"}')).toEqual({
      id: "p1",
      name: "Desk",
    });
  });

  it("rejects documents without id", () => {
    expect(() => parseDocumentJson('{"name":"Desk"}')).toThrow(/id/i);
  });

  it("parses snapshot JSON", () => {
    expect(parseSnapshotJson('{"products":[{"id":"p1"}]}')).toEqual({
      products: [{ id: "p1" }],
    });
  });

  it("previews documents", () => {
    expect(documentPreview({ id: "p1", name: "Desk", sku: "D1" })).toContain(
      "name: Desk",
    );
  });
});
