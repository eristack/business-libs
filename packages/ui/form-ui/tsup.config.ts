import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "@eristack/design-system",
    "@eristack/money",
    "@eristack/money/react",
    "@eristack/percent",
    "@eristack/timestamp",
    "react",
  ],
});
