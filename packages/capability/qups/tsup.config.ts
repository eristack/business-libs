import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/drizzle/index.ts",
    "src/backseat/index.ts",
    "src/backseat/store/index.ts",
  ],
  format: ["esm", "cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  external: [
    "@eristack/backseat",
    "@eristack/backseat/store",
    "@eristack/backseat/adapters",
    "@eristack/money",
    "decimal.js",
    "drizzle-orm",
    "drizzle-orm/pg-core",
    "drizzle-orm/mysql-core",
    "drizzle-orm/sqlite-core",
  ],
});
