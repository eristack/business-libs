import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/drizzle/index.ts", "src/zod/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ["drizzle-orm", "zod"],
});
