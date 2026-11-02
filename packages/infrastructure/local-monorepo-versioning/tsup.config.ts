import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/node/index.ts", "src/cli.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: "",
  },
});
