import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { runSync } from "../src/sync/run.js";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../../..",
);

/**
 * These spawn the real repo-wide knowledge/docs checks (~4–5s idle). Under
 * `turbo run test` they compete with ~60 parallel tasks, so vitest's 5s default
 * turned machine load into a spurious `@eristack/ai-dev#test` CI failure.
 */
const REPO_CHECK_TIMEOUT_MS = 60_000;

describe("runSync", () => {
  it(
    "knowledge check succeeds when catalog is in sync",
    () => {
      const result = runSync(repoRoot, "knowledge", true);
      expect(result.target).toBe("knowledge");
      expect(result.check).toBe(true);
      expect(result.ok, result.output).toBe(true);
    },
    REPO_CHECK_TIMEOUT_MS,
  );

  it(
    "docs check succeeds when nav catalog matches package docs",
    () => {
      const result = runSync(repoRoot, "docs", true);
      expect(result.target).toBe("docs");
      expect(result.check).toBe(true);
      expect(result.ok, result.output).toBe(true);
    },
    REPO_CHECK_TIMEOUT_MS,
  );
});
