import { describe, expect, it } from "vitest";
import {
  completeUploadBodySchema,
  fileRefSchema,
  presignUploadBodySchema,
} from "../src/zod/schemas.js";

describe("file-manager zod schemas", () => {
  it("parses presign body", () => {
    const parsed = presignUploadBodySchema.parse({
      originalName: "a.png",
      mimeType: "image/png",
      sizeBytes: 10,
    });
    expect(parsed.originalName).toBe("a.png");
  });

  it("parses file ref", () => {
    const parsed = fileRefSchema.parse({
      v: 1,
      provider: "s3",
      bucket: "b",
      key: "k",
      mimeType: "text/plain",
      sizeBytes: 0,
      originalName: "x",
    });
    expect(parsed.provider).toBe("s3");
  });

  it("rejects invalid complete body", () => {
    expect(() => completeUploadBodySchema.parse({})).toThrow();
  });
});
