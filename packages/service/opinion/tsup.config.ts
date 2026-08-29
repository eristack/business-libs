import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/express/index.ts", "src/openapi/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ["@eristack/rest", "@eristack/pbac", "express"],
});
