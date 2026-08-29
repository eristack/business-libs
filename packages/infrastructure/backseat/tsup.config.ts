import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/testing/index.ts",
    "src/store/index.ts",
    "src/react/index.ts",
    "src/seeds/index.ts",
    "src/adapters/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ["react", "@tanstack/react-query"],
});
