import { describe, expect, it } from "vitest";
import {
  createFileRef,
  parseFileRef,
  serializeFileRef,
} from "../src/core/file-ref.js";

describe("FileRef", () => {
  const sample = createFileRef({
    provider: "s3",
    bucket: "app-uploads",
    key: "prod/invoices/2026/03/id.pdf",
    mimeType: "application/pdf",
    sizeBytes: 100,
    originalName: "invoice.pdf",
  });

  it("round-trips JSON", () => {
    const json = serializeFileRef(sample);
    expect(parseFileRef(json)).toEqual(sample);
  });

  it("rejects invalid version", () => {
    expect(() => parseFileRef({ ...sample, v: 2 })).toThrow(/version/i);
  });

  it("rejects negative size", () => {
    expect(() =>
      createFileRef({
        provider: "s3",
        bucket: "b",
        key: "k",
        mimeType: "text/plain",
        sizeBytes: -1,
        originalName: "x",
      }),
    ).toThrow(/sizeBytes/i);
  });
});
