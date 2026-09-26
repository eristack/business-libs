import { describe, expect, it } from "vitest";
import { buildObjectKey, sha256Hex } from "../src/core/object-key.js";

describe("buildObjectKey", () => {
  it("includes prefix, namespace, and extension", () => {
    const key = buildObjectKey({
      prefix: "prod/acme",
      namespace: "Invoices",
      originalName: "report.PDF",
      fileId: "fixed-id",
    });
    expect(key).toMatch(/^prod\/acme\/invoices\/\d{4}\/\d{2}\/fixed-id\.pdf$/);
  });

  it("defaults namespace to default", () => {
    const key = buildObjectKey({
      originalName: "x.bin",
      fileId: "id-1",
    });
    expect(key).toMatch(/^default\//);
  });
});

describe("sha256Hex", () => {
  it("hashes bytes", () => {
    expect(sha256Hex(new TextEncoder().encode("abc"))).toHaveLength(64);
  });
});
