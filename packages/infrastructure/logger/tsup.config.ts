import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/express/index.ts", "src/nest/index.ts"],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: ["express", "@nestjs/common", "rxjs"],
});
