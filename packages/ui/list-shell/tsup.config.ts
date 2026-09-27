import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "@eristack/data-grid",
    "@eristack/design-system",
    "@tanstack/react-query",
    "react",
  ],
});
