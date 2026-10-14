import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ["react"],
});
