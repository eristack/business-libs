import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/drizzle/index.ts",
    "src/rest/index.ts",
    "src/zod/index.ts",
    "src/express/index.ts",
    "src/nest/index.ts",
    "src/client/index.ts",
    "src/react/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "decimal.js",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/mysql-core",
    "drizzle-orm/sqlite-core",
    "express",
    "@nestjs/common",
    "@nestjs/core",
    "react",
    "@tanstack/react-form",
    "zod",
  ],
});
