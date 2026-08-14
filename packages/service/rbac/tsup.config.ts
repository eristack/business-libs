import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/backseat/index.ts",
    "src/backseat/store/index.ts",
    "src/index.ts",
    "src/drizzle/index.ts",
    "src/express/index.ts",
    "src/nest/index.ts",
    "src/react/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "@eristack/backseat",
    "@eristack/backseat/store",
    "@eristack/backseat/adapters",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/mysql-core",
    "drizzle-orm/sqlite-core",
    "express",
    "@nestjs/common",
    "@nestjs/core",
    "react",
    "reflect-metadata",
    "rxjs",
  ],
});
