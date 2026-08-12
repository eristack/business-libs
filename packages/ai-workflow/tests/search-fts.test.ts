import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { createWorkflowClient } from "../src/client.js";
import { initWorkflow } from "../src/workflow/init.js";

describe("fts index without embeddings", () => {
  it("indexes a fixture file and finds it via search", async () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "eristack-idx-"));
    initWorkflow(root);
    fs.mkdirSync(path.join(root, "src"), { recursive: true });
    fs.writeFileSync(
      path.join(root, "src", "tokens.ts"),
      `export function rotateRefreshToken() {\n  return "opaque-refresh";\n}\n`,
      "utf8",
    );

    const client = createWorkflowClient(root);
    const result = await client.reindex({ embed: false });
    expect(result.indexed).toBeGreaterThanOrEqual(1);

    const hits = await client.search("rotateRefreshToken");
    expect(hits.length).toBeGreaterThan(0);
    expect(hits[0]?.path).toContain("tokens.ts");
    expect(hits[0]?.snippet.split("\n").length).toBeLessThanOrEqual(3);
  });
});
