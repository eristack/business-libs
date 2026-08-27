import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts", "src/repo/index.ts"],
    format: ["esm", "cjs"],
    dts: false,
    sourcemap: true,
    clean: true,
  },
  {
    entry: { cli: "src/cli.ts", mcp: "src/mcp.ts" },
    format: ["esm"],
    dts: false,
    sourcemap: true,
    clean: false,
    banner: {
      js: "#!/usr/bin/env node",
    },
  },
]);
