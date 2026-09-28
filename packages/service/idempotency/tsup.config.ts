import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/drizzle/index.ts",
    "src/express/index.ts",
    "src/nest/index.ts",
    "src/client/index.ts",
    "src/zod/index.ts",
    "src/testing/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "@nestjs/common",
    "@nestjs/core",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/mysql-core",
    "drizzle-orm/sqlite-core",
    "express",
    "rxjs",
    "zod",
  ],
});
