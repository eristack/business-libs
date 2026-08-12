import { describe, expect, it } from "vitest";
import { chunkText } from "../src/index/chunk.js";

describe("chunkText", () => {
  it("emits overlapping chunks with line ranges", () => {
    const lines = Array.from({ length: 50 }, (_, i) => `line-${i + 1}`);
    const chunks = chunkText("src/a.ts", lines.join("\n"), {
      maxLines: 20,
      overlap: 5,
    });
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks[0]?.startLine).toBe(1);
    expect(chunks[0]?.endLine).toBe(20);
    expect(chunks[1]?.startLine).toBe(16);
  });
});
