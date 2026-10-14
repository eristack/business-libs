import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/zod/index.ts", "src/bundled/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ["zod"],
});
