import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

describe("sync-catalog --check", () => {
  it("passes when generated files match sources", () => {
    expect(() => {
      execFileSync(process.execPath, ["scripts/sync-catalog.mjs", "--check"], {
        cwd: packageRoot,
        stdio: "pipe",
        env: process.env,
      });
    }).not.toThrow();
  });
});
