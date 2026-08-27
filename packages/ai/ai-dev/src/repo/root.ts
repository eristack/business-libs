import fs from "node:fs";
import path from "node:path";

/** Walk up until pnpm-workspace.yaml is found. */
export function findRepoRoot(start = process.cwd()): string {
  let dir = path.resolve(start);
  for (;;) {
    if (fs.existsSync(path.join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("Could not find pnpm-workspace.yaml — not an Eristack monorepo root?");
    }
    dir = parent;
  }
}
