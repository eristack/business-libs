import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

/** Vitest inlines workspace TS; spine backseat adapters must load built dist (testing subpath). */
const dist = (pkgPath: string) =>
  path.join(repoRoot, "packages", pkgPath, "dist");

export default defineConfig({
  test: { environment: "node" },
  resolve: {
    alias: {
      "@eristack/backseat/seeds": path.join(
        dist("infrastructure/backseat"),
        "seeds/index.js",
      ),
      "@eristack/pbac/backseat": path.join(dist("service/pbac"), "backseat/index.js"),
      "@eristack/epoch/backseat": path.join(dist("service/epoch"), "backseat/index.js"),
      "@eristack/qups/backseat": path.join(dist("capability/qups"), "backseat/index.js"),
      "@eristack/jwt-auth/backseat": path.join(
        dist("service/jwt-auth"),
        "backseat/index.js",
      ),
      "@eristack/data-grid/backseat": path.join(
        dist("service/data-grid"),
        "backseat/index.js",
      ),
    },
  },
});
